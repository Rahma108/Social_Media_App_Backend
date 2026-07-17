
import { HydratedDocument } from 'mongoose';
import { IChat, IUser } from '../../common/interfaces';
import { decrypt } from '../../common/utils/security';
import { ACCESS_EXPIRES_IN, REFRESH_EXPIRES_IN } from '../../config/config';
import { ConflictException, NotFoundException } from '../../common/exception';
import { TokenService } from '../../common/service/token.service';
import { redisService, S3Service } from '../../common/service';
import { LogoutEnum } from '../../common/enums/security.enum';
import { StorageApproachEnum, UploadApproachEnum } from '../../common/enums';
import { ChatRepository, UserRepository } from '../../DB/repository';

export class UserService {
    private readonly tokenService : TokenService
    private readonly s3Service: S3Service
    private readonly userRepository: UserRepository
    private readonly chatRepository: ChatRepository
        constructor(){
            this.tokenService = new TokenService()
            this.s3Service = new S3Service()
            this.userRepository = new UserRepository()
            this.chatRepository = new ChatRepository()
        }
async profile(user: HydratedDocument<IUser>): Promise<{user: IUser , groups : HydratedDocument<IChat>[] }> {
    const data = await this.userRepository.findOne({
        filter: { _id: user._id },
        options: {
            populate: [{ path: "friends" }]
        }
    }) as HydratedDocument<IUser>;

    if (data) {
        data.phone = await decrypt(data.phone);
    }
    const groups = await this.chatRepository.find({
        filter:{
            participants:{$in:[user._id]} ,
            type:"ovm"
        }
    }) 
    return {user : data.toJSON() , groups }
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
    const {Key}= await this.s3Service.uploadLargeAsset({
        file,
        path: `Users/${user._id.toString()}/profile`,
        storageApproach:StorageApproachEnum.MEMORY
    });
    user.profileImage = Key as string
    await user.save();
    return user.toJSON();
}

//     async profileImageWithPreSignedLink({ContentType , Originalname } :{ContentType:string , Originalname:string }, user: HydratedDocument<IUser>):Promise<{user : IUser , url : string }>  {
//         const { url }= await this.s3Service.createPreSignedUploadLink({
//         path: `Users/${user._id.toString()}/profile`,
//         ContentType,
//         Originalname
//     });
//     // user.profileImage = Key as string
//     // await user.save();

//     // if(oldPic){
//     //     await this.s3Service.deleteAsset({
//     //         Key:oldPic 
//     //     })
//     // }
//     return  {user , url  }
// }

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
            // 1 , 2 
    async profileImageWithPreSignedLink(
                {
                    contentType,
                    originalName,
                }: {
                    contentType: string;
                    originalName: string;
                },
                user: HydratedDocument<IUser>,
            ): Promise<{ url: string; key: string }> {
            const key = this.s3Service.generateKey({
                folder: "Users/profile",
                userId: user._id.toString(),
                originalName,
            });

            const { url } = await this.s3Service.createPreSignedUploadLink({
                Key: key,
                ContentType: contentType,
            });

            return {
                url,
                key,
            };
            }

            // بديل ال Lambda function
//         async updateProfileImage(
//             profileImage: string,
//             user: HydratedDocument<IUser>,
//             ): Promise<{ message: string; user: IUser }> {

//             const oldImage = user.profileImage;

//             user.profileImage = profileImage;

//             console.log("profileImage =", profileImage);
//             await user.save();

//             if (oldImage) {
//                 await this.s3Service.deleteAsset({
//                 Key: oldImage,
//                 });
//             }

//             return {
//                 message: "Profile image updated successfully.",
//                 user: user.toJSON(),
//             };
// }

    async deleteProfileImage(
            user: HydratedDocument<IUser>,
            ): Promise<{ message: string; user: IUser }> {

            if (user.profileImage) {
                await this.s3Service.deleteAsset({
                Key: user.profileImage,
                });
            }

            user.profileImage = undefined;

            await user.save();

            return {
                message: "Profile image deleted successfully.",
                user: user.toJSON(),
            };
}
        async deleteProfileCoverImage(
        coverImage: string,
        user: HydratedDocument<IUser>,
        ): Promise<{ message: string; user: IUser }> {

        if (!user.coverImages || user.coverImages.length === 0) {
            throw new Error("No cover images found.");
        }

        const exists = user.coverImages.includes(coverImage);

        if (!exists) {
            throw new Error("Cover image not found.");
        }

        await this.s3Service.deleteAsset({
            Key: coverImage,
        });

        user.coverImages = user.coverImages.filter(
            (image) => image !== coverImage,
        );

        await user.save();

        return {
            message: "Cover image deleted successfully.",
            user: user.toJSON(),
        };
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