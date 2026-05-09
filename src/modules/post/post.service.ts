import { HydratedDocument,  Types } from "mongoose";
import { createPostBodyDTO, UpdatePostBodyDTO, UpdatePostParamsDTO } from "./post.dto";
import { IPost, IUser } from "../../common/interfaces";
import {   redisService, S3Service } from "../../common/service";
import { PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exception";
import { randomUUID } from "crypto";
import { createObjectId } from "../../common/utils/mongoose";
import { getAvailability } from "../../common/utils/post";
import { IPaginate, PaginationDTO } from "../../common/types/pagination.types";
export class PostService {
    private readonly s3Service: S3Service
    private readonly userRepository: UserRepository
    private readonly postRepository: PostRepository

        constructor(){
            this.s3Service = new S3Service()
            this.userRepository = new UserRepository()
            this.postRepository = new PostRepository()
        }

    async listPost({page , size , search } :  PaginationDTO , user : HydratedDocument<IUser>): Promise<IPaginate<IPost>> {
        const posts = this.postRepository.paginate({
            filter:{
                $or:getAvailability(user)

            },
            page , size ,
            options:{
                populate:[
                    {path:"createdBy"} ,
                    {path:"comments" , populate:[{path:"reply"}]} ,
            
            
            ]
            }
        })
        return posts
    }
    async createPost({availability , content , files , tags}: createPostBodyDTO , user : HydratedDocument<IUser>): Promise<IPost>{
        let folderId = randomUUID()
        let FCM_TOKENS : string[] = []
        let mentions: Types.ObjectId[] = []
        if(tags?.length){
            tags = [...new Set(tags)]

        const matchedTags = await this.userRepository.find({filter:{ _id : {$in : tags }}})
        if (matchedTags.length !== tags.length) {
            throw new NotFoundException("Fail to find Match account ✖️")
        }
        for (const tag of tags) {
        mentions.push(Types.ObjectId.createFromHexString(tag))

        const tokens = (await redisService.getFCMs(tag)) || []
        FCM_TOKENS.push(...tokens)
    }
}
        let attachments: string[] = []

        if (files && files.length > 0) {
            attachments = await this.s3Service.uploadAssets({
                files,
                path: `Post/${folderId}`
            }) || []
        }

        const post = await this.postRepository.createOne({

            data:{
                createdBy:user._id ,
                content:content as string ,
                availability ,
                attachments ,
                folderId ,
                tags :  mentions


            }
        })

        if (!post) {
            if (attachments.length > 0) {
                await this.s3Service.deleteAssets({
                    Keys: attachments.map(ele => ({ Key: ele }))
                })
            }
            throw new BadRequestException("Fail to create this post ✖️")
        }

        return post.toJSON()
    }
    async updatePost( 
        {postId}:UpdatePostParamsDTO,
        {availability , content , files = [] , tags = [] , removeFiles = [] , removeTags =[]  }:UpdatePostBodyDTO ,
        user : HydratedDocument<IUser>): Promise<IPost>{

            const post = await this.postRepository.findOne({
                filter :{
                        _id: postId ,
                        createdBy: user._id

                }

            })
            if(!post){
                throw new NotFoundException("Find To Find Matching Post ‼️")
            }
            if(!content && !post.content && !files?.length && removeFiles.length == post.attachments?.length ){
                throw new BadRequestException("We cannot Leave empty post")

            }
            let FCM_TOKENS : string[] = []
            let mentions: Types.ObjectId[] = []
            let folderId = post.folderId

            if(tags?.length){
                tags = [...new Set(tags)]

            }
            for (const tag of tags) {
            mentions.push(Types.ObjectId.createFromHexString(tag))

            const tokens = (await redisService.getFCMs(tag)) || []
            FCM_TOKENS.push(...tokens)
        }
            let attachments: string[] = []

            if (files && files.length > 0) {
                attachments = await this.s3Service.uploadAssets({
                    files,
                    path: `Post/${folderId}`
                }) || []
            }
            const updatedPost = await this.postRepository.findOneAndUpdate({
                filter : {
                    id:post._id ,
                    createdBy : user._id 
                },
                update:[
                {
                    $set: {
                    availability: availability || post.availability,
                    content: content || post.content,
                    attachments: {
                        $setUnion: [
                            { $setDifference: ["$attachments", removeFiles] },
                            attachments
                        ]
                    },
                    tags: {
                        $setUnion: [
                            { $setDifference: ["$tags", removeTags.map(ele => createObjectId(ele))] },
                            tags.map(ele =>createObjectId(ele))
                        ]
                    }
}
                }
            ]
            })

            if (!updatedPost) {
                if (attachments.length > 0) {
                    await this.s3Service.deleteAssets({
                        Keys: attachments.map(ele => ({ Key: ele }))
                    })
                }
                throw new BadRequestException("Fail to create this post ✖️")
            }

            if(removeFiles.length){
                    await this.s3Service.deleteAssets({
                        Keys: removeFiles.map(ele => ({ Key: ele }))
                    })
            }
            
        return updatedPost.toJSON()
    }


    async reactOnPost(
                {postId}:UpdatePostParamsDTO,
                {react} :{react :number} ,
                user : HydratedDocument<IUser>):Promise<IPost>{
                    // like & dislike & other ..
                    const update = react > 0 ? {$addToSet : {likes : user._id }} : {$pull : {likes : user._id }}
                    const post = await this.postRepository.findOneAndUpdate({
                        filter:{
                            _id : postId ,
                            $or:getAvailability(user)
                        },
                        update
                    })
                    if(!post){
                        throw new NotFoundException("Fail to Find Matched Post ‼️")
                    }
                    //Notification
                    const ownerId = post.createdBy.toString()

                    if (ownerId !== user._id.toString()) {

                        let FCM_TOKENS = await redisService.getFCMs(ownerId) || []
                        console.log("TOKENS:", FCM_TOKENS)
                    }

                    return post.toJSON()



                }
    }
export const postService = new PostService()
