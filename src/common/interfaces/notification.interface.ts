import { Types } from "mongoose";
export interface INotification{
    receiverId: Types.ObjectId;  
    senderId?: Types.ObjectId;   
    type: String;
    message: String;
    postId: Types.ObjectId;
    isRead: Boolean;
    createdAt : Date ;
    updatedAt? : Date ;
    deletedAt:  Date ;
}