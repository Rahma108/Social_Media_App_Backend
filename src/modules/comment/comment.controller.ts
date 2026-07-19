import type{ NextFunction, Request, Response } from "express";
import {Router} from 'express'
import { authentication, validation } from "../../middleware";
import { cloudFileUpload, fileFieldValidation } from "../../common/utils/multer";
import { successResponse } from "../../common/response";
import * as validators from './comment.validation'
import { commentService } from "./comment.service";
import { createCommentParamsDTO, createReplyOnParamsDTO } from "./comment.dto";

const router = Router({mergeParams : true })

router.post('/' , authentication() , cloudFileUpload({validation:fileFieldValidation.image}).array("attachments" , 2) ,
    validation(validators.createComment),
    async( req:Request , res:Response , next:NextFunction)=>{
        const data =  await commentService.createComment(req.params as createCommentParamsDTO,{ ...req.body, files: req.files } , req.user)
        return successResponse({res , status : 201 , data })
    })

router.post('/:commentId/reply' , authentication() , cloudFileUpload({validation:fileFieldValidation.image}).array("attachments" , 2) ,
    validation(validators.createReplyOnComment),
    async( req:Request , res:Response , next:NextFunction)=>{
        const data =  await commentService.createReplyOnComment(req.params as createReplyOnParamsDTO,{ ...req.body, files: req.files } , req.user)
        return successResponse({res , status : 201 , data })
    })
  router.delete(
    "/:commentId",
    authentication(),
    async (req: Request, res: Response) => {

        const { commentId } = req.params as { commentId: string };

        await commentService.deleteComment(
            { commentId },
            req.user
        );

        return successResponse({
            res,
            message: "Comment deleted successfully."
        });
    }
    
);

router.patch(
    "/:commentId/restore",
    authentication(),
    async (req: Request, res: Response) => {

        const { commentId } = req.params as {
            commentId: string;
        };

        await commentService.restoreComment(
            { commentId },
            req.user
        );

        return successResponse({
            res,
            message: "Comment restored successfully."
        });
    }
);
export default router