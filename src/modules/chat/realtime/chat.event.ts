import { BadRequestException } from "../../../common/exception"
import { IAuthSocket } from "../../../common/types/express.types"
import { socketIOValidation } from "../../../middleware"
import { chatService, ChatService } from "../chat.service"
import { RedisService, redisService } from "../../../common/service"

import * as validators from '../chat.validation'
import { Server } from "socket.io"
export class ChatEvent {
    private chatService : ChatService
    private redisService : RedisService
   
    constructor(){
        this.chatService = chatService
        this.redisService = redisService

    }
    sayHi = (socket : IAuthSocket)=>{
        
        return socket.on("sayHI" , async(data : {name: string})=>{
            try {
                await socketIOValidation<{name: string}>(validators.sayHi, data)
                const result  = this.chatService.sayHi
                socket.emit("sayHI" , result  )

                
                throw new BadRequestException("FAIL")
                
            } catch (error) {
                socket.emit("custom_error" , error )
            }

        })

    }


    sendMessage = (socket : IAuthSocket)=>{
        
        return socket.on("sendMessage" , async(data : {content: string , sendTo : string} )=>{
            try {
                console.log({data})
                await this.chatService.sendMessage(data , socket.data.user)
                socket.emit("successMessage" , {content : data.content})
                socket.to( await this.redisService.getSockets(data.sendTo) as string[]).emit("newMessage" , {content:data.content, from: socket.data.user})
                
            } catch (error) {
                socket.emit("custom_error" , error )
            }

        })

    }

    // sendGroupMessage

    sendGroupMessage = (socket: IAuthSocket) => {
    return socket.on("sendGroupMessage", async ({ content, groupId }) => {
        try {
            const roomId = await this.chatService.sendGroupMessage({ content, groupId }, socket.data.user);
            const io: Server = (socket as any).server;

            const senderSockets = await this.redisService.getSockets(socket.data.user._id);

            if (senderSockets) {
                io.to(senderSockets).emit("successMessage", { content, sendTo: groupId });
                } else {
                    socket.emit("successMessage", { content, sendTo: groupId });
                }
            socket.to(roomId).emit("newMessage" , { content, groupId  })

            
        } catch (error) {
            socket.emit("custom_error", error);
        }
    });
}
   //  join_room
    join_room = (socket: IAuthSocket) => {
        return socket.on("join_room", async ({ roomId }:{roomId : string }) => {
            try {
                socket.join(roomId)

            } catch (error) {
                socket.emit("custom_error", error);
            }
        });
    }
    
    


}

export const chatEvent = new ChatEvent()