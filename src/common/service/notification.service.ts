
// ✔️ Create → create / insertMany
// ✔️ Read → find + populate + count
// ✔️ Update → mark as read
// ✔️ Delete → deleteOne / deleteMany

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import  admin from 'firebase-admin'
import { NotificationModel } from '../../DB/models/notification.model';
import { NotificationTypeEnum } from "../enums/notification.enum";


export class NotificationService {

    private client:admin.app.App ;
    constructor(){
        const serviceAccount = JSON.parse(
            readFileSync(resolve("./src/config/social-media-app-7b804-firebase-adminsdk-fbsvc-a0772f1b98.json")) as unknown as string
        );
        this.client = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
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
        senderId,
        type,
        message,
        postId,
        commentId,
        replyId
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
            
        async hardDeleteNotification (id: string){
            return await NotificationModel.findByIdAndDelete(id);
            };

        async  deleteAllNotifications (userId: string)  {
            return await NotificationModel.deleteMany({ receiverId: userId });
            };


}


export const notificationService = new NotificationService()
