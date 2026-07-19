
// ✔️ Create → create / insertMany
// ✔️ Read → find + populate + count
// ✔️ Update → mark as read
// ✔️ Delete → deleteOne / deleteMany

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import  admin from 'firebase-admin'
import { NotificationModel } from '../../DB/models/notification.model';
import { NotificationTypeEnum } from "../enums/notification.enum";
import { redisService } from "./redis.service";



export class NotificationService {

    private client:admin.app.App ;
    private readonly redisService = redisService
    constructor(){
        const serviceAccount = JSON.parse(
            readFileSync(resolve("./src/config/social-media-app-7b804-firebase-adminsdk-fbsvc-a0772f1b98.json")) as unknown as string
        );
        this.client = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        this.redisService = redisService 
    }

    async sendNotification({
        token ,
        data
    }:{
        token : string ;
        data:{
            title : string ;
            body: string ;
        }
    }){
    const message = {
        token,
        data
    };

    return await this.client.messaging().send(message);



    }
    async sendMultipleNotification({
        tokens ,
        data
    }:{
        tokens : string[] ;
        data:{
            title : string ;
            body: string ;
            postId?: string;
            commentId?: string;
        }
    }){
    await Promise.allSettled(
        tokens.map(token =>{ return this.sendNotification({token , data })  } )



    )

    }

    // CREATE Notification

    async createNotification({
            receiverId,
            senderId,
            type,
            message,
            postId,
            commentId,
            replyId
        }: {
            receiverId: string;
            senderId?: string;
            type: NotificationTypeEnum;
            message: string;
            postId?: string;
            commentId?: string;
            replyId?: string;
        }) {
        return await NotificationModel.create({
            receiverId,
            type,
            message,

            ...(senderId && { senderId }),
            ...(postId && { postId }),
            ...(commentId && { commentId }),
            ...(replyId && { replyId })
        });
        }


       // Get all user notifications
    async getUserNotifications (userId: string){
        return await NotificationModel.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .populate("senderId", "userName")
            .populate("postId");
        };

        //Unread count
        async getUnreadCount (userId: string) {
        return await NotificationModel.countDocuments({
            receiverId: userId,
            isRead: false
        });
        };


    async markAsRead (id: string) {
        return await NotificationModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
        };


        async markAllAsRead (userId: string) {
                return await NotificationModel.updateMany(
                    { receiverId: userId, isRead: false },
                    { isRead: true }
                );
                };

          // Soft Delete 
        async softDeleteNotification (id: string) {
            return await NotificationModel.findByIdAndUpdate(id, {
                deletedAt: new Date()
            });
            };
            
        async hardDeleteNotification(id: string) {
                return await NotificationModel.findOneAndDelete({
                    _id: id
                });
            }
        async  deleteAllNotifications (userId: string)  {
            return await NotificationModel.deleteMany({ receiverId: userId });
            };
            async notify({
            receiverId,
            senderId,
            type,
            title,
            message,
            postId,
            commentId,
            replyId
        }: {
            receiverId: string;
            senderId?: string;
            type: NotificationTypeEnum;
            title: string;
            message: string;
            postId?: string;
            commentId?: string;
            replyId?: string;
        }) {

                console.log({
                    receiverId,
                    senderId
                });
            // Don't notify yourself

            console.log("1- notify called");

            if (receiverId === senderId) return;

            console.log("2- before createNotification");

        await this.createNotification({
            receiverId,
            type,
            message,
            ...(senderId && { senderId }),
            ...(postId && { postId }),
            ...(commentId && { commentId }),
            ...(replyId && { replyId })
        });
        console.log("3- notification saved");

        const tokens = [...new Set(await this.redisService.getFCMs(receiverId) || [])];

        console.log("4- tokens", tokens);

        if (!tokens.length) return;

        await this.sendMultipleNotification({
            tokens,
            data: {
                title,
                body: message,
                ...(postId && { postId }),
                ...(commentId && { commentId })
            }
        });

        console.log("5- push sent");
    }

            async deletePostNotifications(postId: string) {
            return await NotificationModel.deleteMany({
                postId
            });
            }

        async deleteCommentNotification(commentId: string) {
            return await NotificationModel.deleteMany({
                commentId
            });
        }

        async deleteCommentNotifications(commentIds: string[]) {
            return await NotificationModel.deleteMany({
                commentId: { $in: commentIds }
            });
        }

}



export const notificationService = new NotificationService()
