import { Types } from 'mongoose';
import { IUser } from './user.interface';


export interface IMessage{
        content:string ;
        attachments?:string[];
        likes? :Types.ObjectId[] | IUser[]
        tags? :Types.ObjectId[] | IUser[]
        createdBy : Types.ObjectId | IUser;

    }

export interface IChat {

    // OVO
    participants : Types.ObjectId[] | IUser[] ;
    messages :IMessage[];

    //OVM
    group_name?:string;
    group_image?:string;
    roomId?:string;
    type ?:string
    createdBy:Types.ObjectId | IUser
    
    createdAt : Date ;
    updatedAt? : Date ;
    deletedAt : Date ;
    restoredAt : Date ;
}