import type{ NextFunction, Request, Response } from "express";
import {Router} from 'express'
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './post.validation'
import { postService } from "./post.service";
import { ReactPostParamsDTO, ReactPostQueryDTO, UpdatePostParamsDTO } from "./post.dto";
import { paginationValidationSchema } from "../../common/validation";
import { PaginationDTO } from "../../common/types/pagination.types";
import { commentRouter } from "../comment";
const router = Router()

router.use("/:postId/comment" , commentRouter)

router.get('/' , authentication() ,
            validation(paginationValidationSchema),
    async( req:Request , res:Response , next:NextFunction)=>{
        const data =  await postService.listPost( req.query as PaginationDTO , req.user)
        return successResponse({res , data })
    })

router.post('/' , authentication() , cloudFileUpload({validation:fileFieldValidation.image}).array("attachments" , 2) ,
    validation(validators.createPost),
    async( req:Request , res:Response , next:NextFunction)=>{
        const data =  await postService.createPost(req.body , req.user)
        return successResponse({res , status : 201 , data })
    })

router.patch('/update-post/:postId' , authentication() , cloudFileUpload({validation:fileFieldValidation.image}).array("attachments" , 2) ,
    validation(validators.updatePost),
    async( req:Request , res:Response , next:NextFunction)=>{
        const data =  await postService.updatePost(req.params as UpdatePostParamsDTO , req.body , req.user)
        return successResponse({res , status : 200 , data })
    })


router.patch('/:postId/react' , authentication() , cloudFileUpload({validation:fileFieldValidation.image}).array("attachments" , 2) ,
    validation(validators.reactPost),
    async( req:Request , res:Response , next:NextFunction)=>{
        const data =  await postService.reactOnPost(req.params as ReactPostParamsDTO , req.query as unknown as ReactPostQueryDTO , req.user)
        return successResponse({res , status : 200 , data })
    })











export default router