import { HydratedDocument } from 'mongoose';

import {Router} from 'express'
import type {  Request , Response , NextFunction } from 'express'
import { successResponse } from '../../common/response'
const router = Router()
import userService from "../user/user.service";
import { authentication, authorization, endPoints } from '../../middleware';
import { IUser } from '../../common/interfaces';
import { TokenTypeEnum } from '../../common/enums/security.enum';
import { UnauthorizedException } from '../../common/exception';
import { cloudFileUpload, fileFieldValidation } from '../../common/utils/multer';
import { StorageApproachEnum } from '../../common/enums';
router.get('/' ,authentication(TokenTypeEnum.access) , authorization(endPoints.profile) , 
    async(req:Request , res:Response , next:NextFunction)=>{

    const data = await userService.profile(req.user as HydratedDocument<IUser>);
    return successResponse({res , data })
})
// Logout
router.get('/rotate' , authentication(TokenTypeEnum.refresh) , async (req:Request , res:Response , next:NextFunction)=>{
    if (!req.user || !req.decoded) {
        throw new UnauthorizedException("Invalid token ❌");
    }
    const result = await  userService.rotateToken(req.user , req.decoded as {iat:number , jti:string , sub:string } ,`${req.protocol}://${req.host}`)
    return successResponse({res , data:result})
})

router.post('/logout', authentication() ,  async(req , res , next)=>{
    const status = await userService.logout(req.body.flag , req.user, req.decoded as {iat:number , jti:string , sub:string })
    return successResponse({res  , status:status  })
})
router.patch('/profile-image' ,authentication(TokenTypeEnum.access) , authorization(endPoints.profile) , 
    cloudFileUpload({
        storageApproach :StorageApproachEnum.MEMORY ,
        validation:fileFieldValidation.image
    }).single("attachment") ,
    async(req:Request , res:Response , next:NextFunction)=>{

    const data = await userService.profileImage(req.file as Express.Multer.File , req.user as HydratedDocument<IUser>);    return successResponse({res , data})
})
// 1- Generate Pre-Signed URL
            router.post(
            "/profile-image/upload-url",
            authentication(TokenTypeEnum.access),
            authorization(endPoints.profile),
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    console.log("Content-Type:", req.headers["content-type"]);
                        console.log("Body:", req.body);
                    console.log(req.body);
                const data = await userService.profileImageWithPreSignedLink(
                    req.body,
                    req.user as HydratedDocument<IUser>,
                );

                return successResponse({ res, data });
                } catch (error) {
                next(error);
                }
            },
            );

            // 2- Update Profile Image
            router.patch(
            "/profile-image/upload-url",
            authentication(TokenTypeEnum.access),
            authorization(endPoints.profile),
            async (req: Request, res: Response, next: NextFunction)=> {
                try {
                const data = await userService.updateProfileImage(
                    req.body.profileImage,
                    req.user as HydratedDocument<IUser>,
                );
                console.log(req.body);

                return successResponse({ res, data });
                } catch (error) {
                next(error);
                }
            },
            );

            // 3- Delete Profile Image
            router.delete(
            "/profile-image",
            authentication(TokenTypeEnum.access),
            authorization(endPoints.profile),
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                const data = await userService.deleteProfileImage(
                    req.user as HydratedDocument<IUser>,
                );

                return successResponse({ res, data });
                } catch (error) {
                next(error);
                }
            },
            );
router.patch('/profile-cover-images' ,authentication(TokenTypeEnum.access) , authorization(endPoints.profile) , 
    cloudFileUpload({
        storageApproach :StorageApproachEnum.DISK ,
        validation:fileFieldValidation.image
    }).array("attachments" , 2 ) ,
    async(req:Request , res:Response , next:NextFunction)=>{

    const data = await userService.profileCoverImages(req.files as Express.Multer.File[] , req.user as HydratedDocument<IUser>);
    return successResponse({res , data})
})

        router.delete(
        "/profile-cover-images",
        authentication(TokenTypeEnum.access),
        authorization(endPoints.profile),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
            const data = await userService.deleteProfileCoverImage(
                req.body.coverImage,
                req.user as HydratedDocument<IUser>,
            );

            return successResponse({ res, data });
            } catch (error) {
            next(error);
            }
        },
        );

router.delete('/profile', authentication() ,  async(req:Request , res:Response , next:NextFunction)=>{
    const data = await userService.deleteProfile( req.user)
    return successResponse({res  , data  })
})
export default router 


