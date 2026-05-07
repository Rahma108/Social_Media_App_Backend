import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";
import { EmailEnum } from "../enums";
import { Types } from "mongoose";


type SetParams = {
    key: string;
    value: any;
    ttl?: number | undefined;
};

type KeyParam = string;

type ExpireParams = {
    key: string;
    ttl:  number ;
};

type BaseKeyType ={
    email: string; type?: EmailEnum 
}
 class RedisService{
    private client : RedisClientType;
    constructor(){
        this.client = createClient({
            url:REDIS_URI
        })
        this.handleEvents()
    }
    private handleEvents(){
        this.client.on("connect", ()=>
            console.log(`REDIS_DB CONNECTED SUCCESSFULLY ✔️`)) 
        this.client.on("error", (error)=>
            console.log(`FAIL TO CONNECT ON REDIS_DB ❌${error}`) )
        this.client.on("end", () => {
            console.log("Redis connection closed ❌");
            });

            this.client.on("reconnecting", () => {
            console.log("Redis reconnecting 🔄");
            });
    }


    public connectRedis = async()=>{
    try {
        if (this.client.isOpen) return;
            await this.client.connect()
    } catch (error) {
        console.log(`FAIL TO CONNECT ON REDIS_DB ❌${error}`)
    }
}

    public set = async ({ key, value, ttl }: SetParams): Promise<any> => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        let result: string | null;
        if (ttl) {
        result = (await this.client.set(key, data, { EX: ttl })) as string | null;
        } else {
        result = (await this.client.set(key, data)) as string | null;
        }
        return result ?? null;

    } catch (error) {
        console.log(`Fail in redis set Operations ${error}`);
        return null;
    }
};
    baseRevokeTokenKey = (userId:string): string => {
    return `RevokeToken::${userId}`;
};

    revokeTokenKey = ({ userId, jti }: { userId: string , jti: string }): string => {
    return `${this.baseRevokeTokenKey(userId)}::${jti}`;
};

    otpKey = ({ email, type = EmailEnum.confirmEmail }: BaseKeyType ): string => {
    return `OTP:USER::${email}::${type}`;
};

    otpMaxRequestKey = ({ email, type = EmailEnum.confirmEmail }: BaseKeyType ): string => {
    return `${this.otpKey({ email, type })}::Request`;
};

    otpBlockKey = ({ email, type = EmailEnum.confirmEmail }:BaseKeyType ): string => {
    return `${this.otpKey({ email, type })}::Block::Request`;
};

    public exists = async (key : string) => {
    try {
        return  await this.client.exists(key);
    } catch (error) {
        console.log(`Fail in redis Exists Operations ${error}`);
        return ;
    }
};

    public ttl = async (key : string) :Promise<number> => {
    try {
 
        return  await this.client.ttl(key);
    } catch (error) {
        console.log(`Fail in redis TTL Operations ${error}`);
        return  -1;
    }
};

    public  expire = async ({key  , ttl }  : ExpireParams) => {
    try {
        return  await this.client.expire(key , ttl);
    } catch (error) {
        console.log(`Fail in redis Expire Operations ${error}`);
        return ;
    }
};

    public  keys = async (prefix:string) : Promise<string[]> => {
    try {
        return  await this.client.keys(`${prefix}*`);
    } catch (error) {
        console.log(`Fail in redis Prefix Operations ${error}`);
        return [];
    }
}
    public  get = async (key: string): Promise<any > => {
    try {
        const data = await this.client.get(key);
        if (!data) return null;
        try {
        return JSON.parse(data as string);
        } catch {
        return data;
        }
    } catch (error) {
        console.log(`Fail in redis get Operations ${error}`);
    }
};

    public mGet = async (keys: string[] = []): Promise<any[]> => {
    try {
        if (!keys.length) return [];

        return await this.client.mGet(keys);
    } catch (error) {
        console.log(`Fail in redis mGet Operations ${error}`);
        return [];
    }
};

    public deleteKeys = async (keys: string | string[]): Promise<number> => {
    try {
        if (!keys.length) return 0;
        return await this.client.del(keys);
    } catch (error) {
        console.log(`Fail in redis del Operations ${error}`);
        return 0;
    }
};

    public update = async ({ key, value, ttl }: SetParams): Promise<any> => {
    try {
        if(!await this.exists(key))return 0;
        return this.set({key, value, ttl})
    } catch (error) {
        console.log(`Fail in redis update Operations ${error}`);
        return null;
    }
};

    public increment = async (key:KeyParam ): Promise<number> => {
    try {
        return await this.client.incr(key);
    } catch (error) {
        console.log(`FAIL IN REDIS INCREMENT OPERATIONS ${error}🫠`);
        return 0;
    }
};

   // Firebase 
    FCMKey(userId : string | Types.ObjectId ) {
        return `user:FCM:${userId}`;
    }
    async addFCM(userId : string | Types.ObjectId, FCMToken : string) {
        return await this.client.sAdd(this.FCMKey(userId), FCMToken);
    }

    async  removeFCM(userId : string | Types.ObjectId, FCMToken: string) {
        return await this.client.sRem(this.FCMKey(userId), FCMToken);
    }

    async getFCMs(userId : string | Types.ObjectId) {
        return await this.client.sMembers(this.FCMKey(userId));
    }

    async hasFCMs(userId : string | Types.ObjectId) {
        return await this.client.sCard(this.FCMKey(userId));
    }

    async removeFCMUser(userId : string | Types.ObjectId) {
        return await this.client.del(this.FCMKey(userId));
}

}

export const redisService = new RedisService()


