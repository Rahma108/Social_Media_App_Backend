
import {z} from 'zod'

import { generalValidationFields } from '../../common/validation'

export const createComment ={
    params:z.strictObject({
        postId:generalValidationFields.id
    }),
    body: z.strictObject({
        content: z.string().optional() ,
        files: z.array(z.any()).optional().default([]),

        tags : z.array(generalValidationFields.id).optional(),
        
    }).superRefine((args , ctx)=>{

        if(!args.content && ! args.files?.length ){

            ctx.addIssue({
                code : "custom" ,
                path : ['content'] ,
                message : "Content is Required"
            })

        }

        if(args.tags){
            const uniqueTags= [...new Set(args.tags)]
            if(uniqueTags.length != args.tags.length ){
                ctx.addIssue({
                    code : "custom" ,
                    path : ['tags'] ,
                    message : "Duplicated Mention accounts "
                })

            }
                
            }
})
        }


export const createReplyOnComment ={
    params:z.strictObject({
        postId:generalValidationFields.id,
        commentId:generalValidationFields.id
    }),
    body: createComment.body
}

