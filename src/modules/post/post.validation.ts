
import {z} from 'zod'
import { AvailabilityEnum } from '../../common/enums'
import { generalValidationFields } from '../../common/validation'

export const createPost ={

    body: z.strictObject({
        content: z.string().optional() ,
        files: z.array(z.any()).optional().default([]),

        tags : z.array(generalValidationFields.id).optional(),
        availability: z.coerce.number().default(AvailabilityEnum.PUBLIC)
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
export const updatePost ={
    params:z.strictObject({
        postId:generalValidationFields.id
    }
    ),
    body: z.strictObject({
        content: z.string().optional() ,
        files: z.array(z.any()).optional() ,

        removeFiles : z.array(z.string()).optional(),
        removeTags : z.array(generalValidationFields.id).optional(),

        tags : z.array(generalValidationFields.id).optional() ,
        availability: z.coerce.number().default(AvailabilityEnum.PUBLIC)


    }).superRefine((args , ctx)=>{

        if(!Object.values(args).length){

            ctx.addIssue({
                code : "custom" ,
                path : ['content'] ,
                message : "Cannot Accept All Fields to be Empty"



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


export const reactPost ={
    params:z.strictObject({
        postId:generalValidationFields.id
    }
    ),
    query: z.strictObject({
        react: z.coerce.number()
    })

}



