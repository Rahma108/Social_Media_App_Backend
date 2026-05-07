import { UserRepository } from './../../DB/repository/user.repository';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN, System_REFRESH_TOKEN_SECURITY_KEY, System_TOKEN_SECURITY_KEY, User_REFRESH_TOKEN_SECURITY_KEY, User_TOKEN_SECURITY_KEY } from '../../config/config'
import {  TokenTypeEnum } from '../enums/security.enum';
import { RoleEnum } from '../enums';
import { IUser } from '../interfaces';
import { randomUUID } from 'node:crypto';
import { BadRequestException, UnauthorizedException } from '../exception';
import { redisService } from "../../common/service";
import { HydratedDocument } from 'mongoose';
export class TokenService { 
    private readonly redisService  = redisService
    private readonly userRepository : UserRepository
    constructor(){
        this.userRepository  = new UserRepository();
    }

    async sign({
        payload ,
        secret = User_TOKEN_SECURITY_KEY , 
        options
    } :{
        payload:object,
        secret?: string,
        options?: SignOptions ,
    } ):Promise<string>{


        return jwt.sign(payload , secret  , options )
    }
    async verify({
        token  ,
        secret = User_TOKEN_SECURITY_KEY , 
    } :{
        token: string,
        secret?: string,
    }): Promise<JwtPayload>{

        return  jwt.verify(token , secret ) as JwtPayload

    }
// export type TokenSignature = {
//   accessSignature: string;
//   refreshSignature: string;
//   audience: AudienceEnum;
// };
    async getTokenSignature (
        { tokenType = TokenTypeEnum.access , level } 
        : {tokenType : TokenTypeEnum , level :RoleEnum } ): Promise<string>{

        const { accessSignature  , refreshSignature } = await this.getTokenSignatureLevel(level)
        let signature = undefined 
        switch (tokenType) {
            case TokenTypeEnum.refresh:
                signature = refreshSignature
                break;
            default:
                signature = accessSignature
                break;
        }
        return signature
    }

async getTokenSignatureLevel (level : RoleEnum ) : Promise<{accessSignature: string , refreshSignature: string }>{

    let signatureLevel : {accessSignature: string , refreshSignature: string };
    switch (level) {
        case RoleEnum.ADMIN:
        signatureLevel = {accessSignature : System_TOKEN_SECURITY_KEY , refreshSignature  : System_REFRESH_TOKEN_SECURITY_KEY};
        break;
        default:
            signatureLevel = {accessSignature : User_TOKEN_SECURITY_KEY, refreshSignature  : User_REFRESH_TOKEN_SECURITY_KEY};
        break;
    }
    return signatureLevel;
};
async  decodeToken(
    {
        token,
        tokenType = TokenTypeEnum.access,
    }: {
        token: string;
        tokenType?: TokenTypeEnum;
    }
    ) : Promise<{user:HydratedDocument<IUser> , decoded : JwtPayload }>{
    const decoded = jwt.decode(token) as JwtPayload;

    if (!decoded || !decoded.aud) {
        throw new BadRequestException("Fail to decode this token aud is required");
    }

    const [tokenApproach, level ] = decoded.aud || []

    if ( tokenType !== tokenApproach as unknown as TokenTypeEnum ) {
        throw new BadRequestException(
        `Invalid Token Type ${tokenType}`
        );
    }
    if (
        decoded.jti &&
        (await this.redisService.get(
        this.redisService.revokeTokenKey({ userId: decoded.sub as string, jti: decoded.jti }) //
        ))
    ) {
        throw new UnauthorizedException("Invalid Login Session ❌");
    }

    const secret =
        await this.getTokenSignature({tokenType : tokenApproach as unknown as  TokenTypeEnum, level: level as unknown as RoleEnum  } );

    const verifiedData =  jwt.verify(token , secret )
  
    const user = await this.userRepository.findOne({
    filter: { _id: verifiedData.sub  as string },
    });
    if (!user) {
        throw new UnauthorizedException("Not Register Account!");
    }

    if (
        user.changeCredentialTime &&
        user.changeCredentialTime?.getTime() >= (decoded.iat as number ) * 1000
    ) {
        throw new UnauthorizedException("Invalid Login Session ❌");
    }

    return { user, decoded };
    };



async createLoginCredentials (
    user: HydratedDocument<IUser>,
    issuer: string
    ): Promise<{ access_token: string; refresh_token: string }>{

    const { accessSignature, refreshSignature } =
        await this.getTokenSignatureLevel(user.role as RoleEnum );

    const jwtId = randomUUID();

    const access_token = await this.sign({
        payload: { sub: user._id.toString() },
        secret: accessSignature,
        options: {
        issuer,
        audience: [TokenTypeEnum.access, user.role] as unknown  as string[],
        expiresIn: ACCESS_EXPIRES_IN  ,
        jwtid: jwtId,
        },
    });

    const refresh_token = await this.sign({
        payload: { sub: user._id.toString() },
        secret: refreshSignature,
        options: {
        issuer,
        audience: [TokenTypeEnum.refresh, user.role] as unknown as string[],
        expiresIn: REFRESH_EXPIRES_IN ,
        jwtid: jwtId,
        },
    });

    return { access_token, refresh_token };
};

}

