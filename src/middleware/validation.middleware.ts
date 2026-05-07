
import type{ NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common/exception"
import type { ZodError, ZodType } from "zod"

type KeyRequestType  = keyof Request 
type validationSchemaType = Partial<Record<KeyRequestType ,ZodType >>
type validationErrorType =  Array<{
   key: KeyRequestType , issues: Array<{
                message : string , 
                path : Array<string | number | undefined | symbol >
            }>


}>
export const validation = ( schema :validationSchemaType )=>{

    return (req:Request , res:Response , next:NextFunction )=>{
        const validationErrors : validationErrorType = [] 
        for (const  key of Object.keys(schema) as KeyRequestType[]  ) {
            if(!schema[key]) continue;

            if(req.file){
                req.body = {...req.body ,file: req.file}
            }

            if(req.files){
                req.body = {...req.body ,files : req.files}
            }
            const validationResult = schema[key].safeParse(req[key])
            if(!validationResult.success){
                const error = validationResult.error  as ZodError
                
                validationErrors.push({key , issues :error.issues.map(issue =>{
                    return {message:issue.message , path:issue.path }
                })  })

            }
        }
        if(validationErrors.length> 0 ){
            throw new BadRequestException("Validation Failed ❌" , validationErrors )

        }
        next()
    }


}