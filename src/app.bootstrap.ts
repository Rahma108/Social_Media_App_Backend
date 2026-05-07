import { redisService } from './common/service/redis.service';
import express from 'express'
import type { Request , Response , NextFunction } from 'express'
import { authRouter, userRouter } from './modules'
import cors from 'cors'
import { globalErrorHandler } from './middleware'
import { connectDB } from './DB/connection.db'
import { PORT } from './config/config'
import { s3Service } from './common/service';
import {pipeline} from 'node:stream'
import { promisify } from 'node:util';
import { successResponse } from './common/response';
import { postRouter } from './modules/index'
import { schema } from './modules/graphql';
import { createHandler } from 'graphql-http/lib/use/http';


const s3WriteStream = promisify(pipeline)
export const bootstrap=async ()=>{
    const app:express.Express = express()
    // Global Middleware 
    app.use( express.json())
    app.use(cors({
            origin: "*",
            credentials: true
        }));
    // Base Routing 
    app.get('/' , (req:Request , res:Response , next:NextFunction)=>{  
        res.send("Hello World 🤩")

    })

    // app routing ...
    app.use("/auth" , authRouter)
    app.use('/user', userRouter)
    app.use('/post', postRouter)

    

    app.use("/graphql", createHandler({ schema: schema }));
    // Global Error Handling 
    app.use(globalErrorHandler);
    await connectDB()
    await redisService.connectRedis()
    app.get("/uploads/*path" , async (req:Request , res:Response , next:NextFunction)=>{  
        const {download , fileName } = req.query as {download : string , fileName : string }
        const {path} = req.params as {path : string [] }
        const key = path.join("/");
        const { Body, ContentType } = await s3Service.getAsset({
            Key: key
        });
        res.setHeader(
        "Content-Type",
        ContentType || "application/octet-stream"
    );
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    if(download === "true"){
        res.setHeader("Content-Disposition", `attachment; filename="${ fileName || key.split("/").pop()}"`); // only apply it for  download
    }
        return await s3WriteStream(Body as NodeJS.ReadableStream , res  ) // read - write .
        // return successResponse({res , data:{params : req.params ,  key , data:{Body , ContentType } } , status:200 })

    })

    app.get("/pre-signed/*path" , async (req:Request , res:Response , next:NextFunction)=>{ 
        const {download , fileName } = req.query as {download : string , fileName : string } 
        const {path} = req.params as {path : string [] }
        const Key = path.join("/");
        const url = await s3Service.createPreSignedFetchLink({Key , download , fileName })
        return successResponse({res , data:{url}})
    
    })
    // Invalid Routing 
    app.use('/*dummy' ,  (req:Request , res:Response , next:NextFunction)=>{  
        res.status(400).json({Message  : "Not Found "})

    })
    app.listen(PORT, ()=>{
        console.log(`Server is running on port 3000 🚀`);
        
    })

    console.log(`App Bootstrap Successfully 🤩`);

}