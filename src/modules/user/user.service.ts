
import { HydratedDocument } from 'mongoose';
import { IUser } from '../../common/interfaces';
import { decrypt } from '../../common/utils/security';
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from '../../config/config';
import { ConflictException, NotFoundException } from '../../common/exception';
import { TokenService } from '../../common/service/token.service';
import { redisService, S3Service } from '../../common/service';
import { LogoutEnum } from '../../common/enums/security.enum';
import { StorageApproachEnum, UploadApproachEnum } from '../../common/enums';
import { UserRepository } from '../../DB/repository';

export class UserService {
    private readonly tokenService : TokenService
    private readonly s3Service: S3Service
    private readonly userRepository: UserRepository
    
        constructor(){
            this.tokenService = new TokenService()
            this.s3Service = new S3Service()
            this.userRepository = new UserRepository()
        }
        async profile( user: IUser | HydratedDocument<IUser>){
            if (user) {
            user.phone =await decrypt(user.phone)
}
            return user;
}
    async createRevokeToken( { userId ,jti , ttl  }: { userId:string ,jti:string , ttl:number  }){
    await redisService.set({
                key: redisService.revokeTokenKey({userId , jti}),
                value : jti ,
                ttl 
            })
    return ;
}
    async  rotateToken (user:HydratedDocument<IUser> , {iat , jti ,  sub }:{iat:number , jti:string , sub:string }, issuer: string ){
    const expiresAt = (iat + ACCESS_EXPIRES_IN) * 1000;

    if (expiresAt > Date.now() + 30000) {
        throw new ConflictException("Current access token still valid");
    }
    await this.createRevokeToken({userId:sub , jti , ttl: iat  + REFRESH_EXPIRES_IN })
    return await this.tokenService.createLoginCredentials(user , issuer )
    }

    async logout (flag : LogoutEnum, user : HydratedDocument<IUser> , {jti , iat , sub}: { jti:string  ,iat:number , sub:string } ){
    let status = 200
    switch (flag) {
        case LogoutEnum.All:
            user.changeCredentialTime= new Date(Date.now()) 
            await user.save()

            await redisService.deleteKeys(await redisService.keys(redisService.baseRevokeTokenKey(sub)))
            break;
    
        default:
            await this.createRevokeToken({userId:sub , jti , ttl:iat  + REFRESH_EXPIRES_IN })
            status=201
            break;
        }
    return status

}
    async profileImage(file: Express.Multer.File, user: HydratedDocument<IUser>) {

    // user.profileImage = await this.s3Service.uploadAsset({
    //     file,
    //     path: `Users/${user._id.toString()}/profile`,
    //     storageApproach:StorageApproachEnum.DISK
    // });
    const {Key}= await this.s3Service.uploadLargeAsset({
        file,
        path: `Users/${user._id.toString()}/profile`,
        storageApproach:StorageApproachEnum.DISK
    });
    user.profileImage = Key as string
    await user.save();
    return user.toJSON();
}

    async profileImageWithPreSignedLink({ContentType , Originalname } :{ContentType:string , Originalname:string }, user: HydratedDocument<IUser>):Promise<{user : IUser , url : string }>  {
        // const oldPic = user.profileImage
    
        const { url }= await this.s3Service.createPreSignedUploadLink({
        path: `Users/${user._id.toString()}/profile`,
        ContentType,
        Originalname
    });
    // user.profileImage = Key as string
    // await user.save();

    // if(oldPic){
    //     await this.s3Service.deleteAsset({
    //         Key:oldPic 
    //     })
    // }
    return  {user , url  }
}

    async profileCoverImages(files: Express.Multer.File[] , user: HydratedDocument<IUser>){
        const oldUrls = user.coverImages
            const urls = await this.s3Service.uploadAssets({
                files,
                path: `Users/${user._id.toString()}/profile/covers`,
                storageApproach:StorageApproachEnum.DISK ,
                uploadApproach : UploadApproachEnum.LARGE
            });
            user.coverImages = urls as string[]
            await user.save();

            if(oldUrls?.length){
                await this.s3Service.deleteAssets({
                    Keys:oldUrls.map(ele => {return {Key : ele } } )

                })

            }
            return user.toJSON();
}


    async deleteProfile(user: HydratedDocument<IUser>){
            const account = await this.userRepository.deleteOne({filter:{_id : user._id , force:true  }})
            if(!account.deletedCount){
                throw new NotFoundException("Invalid Account ‼️")


            }
            await this.s3Service.deleteFolderByPrefix({prefix:`Users/${user._id.toString()}`})
            return account
}
    }
export default new UserService()