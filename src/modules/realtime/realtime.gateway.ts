import { Server} from 'socket.io';

import {Server as  HttpServerType} from 'node:http'
import { IAuthSocket } from '../../common/types/express.types';
import { redisService, TokenService } from '../../common/service';
import { chatGateway } from '../chat';

export class RealtimeGateway {
    private io! : Server
    private tokenService : TokenService
    private readonly redisService  = redisService

    constructor(){
        this.tokenService =  new TokenService()

    }
authentication = async (socket: IAuthSocket, next: any) => {
    try {
        const token =
            socket.handshake.auth?.["authorization"] ||
            socket.handshake.headers?.["authorization"] ;

        const result = await this.tokenService.decodeToken({ token });

        if (!result?.user) {
            return next(new Error("Unauthorized"));
        }

        const { user, decoded } = result;

        socket.data = { user, decoded };

        await this.redisService.addSocket(user._id, socket.id);

        next();
    } catch (error) {
        next(error);
    }
};
    initializeIO = (httpServer: HttpServerType )=>{

        
        this.io = new Server(httpServer, {
        cors: { origin: "*" }
        });

        this.io.use(this.authentication)

        this.io.on("connection", async(socket:IAuthSocket) => {

            chatGateway.registerEvents(socket , this.io ) 
            console.log({connections: await this.redisService.getSockets(socket.data.user._id)})
        socket.on("disconnecting", () => {
                    console.log("disconnecting")
                });

                socket.on("disconnect", async (reason) => {
                    console.log("disconnected", reason, socket.id , socket.data.user._id)

                    await this.redisService.removeSocket( socket.data.user._id , socket.id )
                    const connections =  await this.redisService.getSockets(socket.data.user._id) || []
                    if(connections.length < 1 ){
                        this.io.emit("offline_user" ,{
                            userId: socket.data.user._id


                        })

                    }
                });

        })



    }












}


export const realtimeGateway =  new RealtimeGateway()