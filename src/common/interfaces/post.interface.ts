import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { AvailabilityEnum, ReactEnum } from "../enums";

export interface IReaction {
    userId: Types.ObjectId | IUser;
    type: ReactEnum;
}

export interface IPost {
    folderId:string ;
    content?:string ;
    attachments?:string[];
    reactions: IReaction[];
    tags :Types.ObjectId[] | IUser[]

    availability:AvailabilityEnum ;

    createdBy : Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;


    createdAt : Date ;
    updatedAt? : Date ;
    deletedAt : Date ;
    restoredAt : Date ;
}