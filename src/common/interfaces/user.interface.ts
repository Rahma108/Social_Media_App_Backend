
import { Types } from "mongoose";
import { GenderEnum, RoleEnum } from "../enums";


export interface IUser {
    username : string ,
    firstName : string ,
    lastName : string ,
    email: string ,
    password: string ,
    bio?: string ,
    slug:string ,
    DOB?: Date ,
    confirmedAt? : Date ,
    gender? : GenderEnum,
    role ?: RoleEnum ,
    phone : string ,
    profileImage?: string ,
    coverImages?: string[],
    createdAt?: Date;
    updatedAt?: Date;
    _id: Types.ObjectId;
    changeCredentialTime?:Date ,
    confirmEmail?: Date ,
    provider?:Number ,
    extra : {
        name : String
    } ,
    friends?:Types.ObjectId[] |  IUser[],
    deletedAt?: Date ,
    restoredAt?:Date
}