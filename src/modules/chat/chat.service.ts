import { HydratedDocument, Types } from "mongoose";
import { IChat,  IUser } from "../../common/interfaces";
import { ChatRepository, UserRepository } from "../../DB/repository";
import { createObjectId } from "../../common/utils/mongoose";
import { NotFoundException } from "../../common/exception";
import { randomUUID } from "node:crypto";
import { S3Service, s3Service } from "../../common/service";

export class ChatService {
    private s3Service : S3Service
    private chatRepository : ChatRepository
    private userRepository : UserRepository
    constructor(){
        this.chatRepository = new ChatRepository()
        this.userRepository = new UserRepository()
        this.s3Service = s3Service 

    }
    sayHi =()=>{
        return {message :"Done"}
    }
    async getOVOChat(participantId : string , {page , size } :{page : string , size : string } 
        , user : HydratedDocument<IUser>):Promise<IChat>{
        const chat = await this.chatRepository.findOneChat({
            page :parseInt(page)  ,
            size :parseInt(size) ,
            filter:{
                participants:{$all:[user._id , createObjectId(participantId)]} ,

            },
            options: {
            populate: [{ path: "participants" }] 
        }
        })


        if(!chat){
            throw new NotFoundException("Fail to Find Matching chat instance❕")
        }

        return chat.toJSON()
    }

    async sendMessage ({sendTo , content }  :{sendTo : string , content : string} , user:HydratedDocument<IUser>):Promise<IChat>{
        const friend = await this.userRepository.findOne({filter:{
            _id : createObjectId(sendTo) , 
            // friends:{$in:[user._id]}
        }})
        console.log({ friend }) 
        if(!friend ){
            throw new NotFoundException("Not a friend Found ❕")
        }
        let chat = await this.chatRepository.findOneAndUpdate({
                filter:{
                    participants:{$all:[user._id , friend._id ]} ,
                },
                update:{
                    $addToSet:{
                        messages:{content,
                                    createdBy : user._id}
                    } 
                }

            })
        if(!chat){
            chat = await this.chatRepository.createOne({
                data:{
                    participants:[user._id , friend._id ] ,
                    createdBy:user._id ,
                    type:"ovo" ,
                    messages:[
                        {
                            content,
                            createdBy : user._id
                        }
                    ] 
                }
            })
        }

        return chat.toJSON()




    }
    async createChatGroup({participants , group_name }:{participants: string[] , group_name:string }, file:Express.Multer.File
        , user : HydratedDocument<IUser>){
            const  newParticipants:Types.ObjectId[]  = participants.map(ele => createObjectId(ele))
            const roomId = randomUUID()
            let groupImage = undefined 
            if(file){
                groupImage = await this.s3Service.uploadAsset({
                    path:`chat/${roomId}` ,
                    file
                })
            }
            const chat = await this.chatRepository.createOne({
                data:{
                        participants :[...newParticipants , user._id ] , 
                        createdBy:user._id ,
                        group_name ,
                        roomId,
                        group_image:groupImage as string ,
                        type :"ovm"
                }
            })
            return chat
        }


}

export const chatService = new ChatService()