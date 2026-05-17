import { BadRequestException } from "../../../common/exception"
import { IAuthSocket } from "../../../common/types/express.types"
import { socketIOValidation } from "../../../middleware"
import { chatService, ChatService } from "../chat.service"


import * as validators from '../chat.validation'
export class ChatEvent {
    private chatService : ChatService
    constructor(){
        this.chatService = chatService

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


}

export const chatEvent = new ChatEvent()