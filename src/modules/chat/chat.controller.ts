import type{ NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { authentication } from '../../middleware';
import { successResponse } from '../../common/response';
import { chatService } from './chat.service';
import { cloudFileUpload, fileFieldValidation } from '../../common/utils/multer';

const router = Router()

router.post("/group" , authentication() , 
cloudFileUpload({validation: fileFieldValidation.image }).single("attachment"),

async(req : Request, res:Response , next:NextFunction)=>{
    try {
        const chat= await  chatService.createChatGroup(req.body ,  req.user , req.file as Express.Multer.File )
        return successResponse({res , status : 201 ,data:{chat}})
    } catch (error) {
        console.error("OVO CHAT ERROR:", error) 
        return next(error)
    }

} )


router.get("/group/:groupId" , authentication() , 
async(req : Request, res:Response , next:NextFunction)=>{
    try {
        let groupId = req.params['groupId'] 
        const chat= await  chatService.getOVMChatGroup( groupId as string  ,  req.query as unknown as {page : string , size: string } , req.user )
        return successResponse({res , status : 201 ,data:{chat}})
    } catch (error) {
        console.error("OVM CHAT ERROR:", error) 
        return next(error)
    }

} )


router.get("/:participantId/ovo" , authentication() , async(req : Request, res:Response , next:NextFunction)=>{
    try {
        const chat= await  chatService.getOVOChat(req.params['participantId'] as string , 
            req.query as {page : string , size : string} , req.user)
        return successResponse({res , data:{chat}})
    } catch (error) {
        console.error("OVO CHAT ERROR:", error)  
        return next(error)
    }

} )

export default router