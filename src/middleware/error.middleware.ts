import type { NextFunction, Request, Response } from "express"

interface IError extends Error {
    statusCode:number
}
export const globalErrorHandler = (err: IError  , req:Request , res:Response , next:NextFunction )=>{

        if(err.name == "MulterError"){
            err.statusCode = 400 
            
        }
        res.status( err.statusCode || 500 ).json({
            message:err.message || "Internal Server Error" ,
            cause:err.cause,
            error : err ,
            stack:err.stack ,
        })


}