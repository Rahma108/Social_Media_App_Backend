import { HydratedDocument,  Types } from "mongoose";
import { createCommentBodyDTO, createCommentParamsDTO, createReplyOnParamsDTO} from "./comment.dto";
import { IComment, IPost, IUser } from "../../common/interfaces";
import {  redisService, S3Service } from "../../common/service";
import { PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exception";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { getAvailability } from "../../common/utils/post";


class CommentService {
    private readonly s3Service: S3Service
    private readonly userRepository: UserRepository
    private readonly postRepository: PostRepository
    private readonly commentRepository: CommentRepository

        constructor(){
            this.s3Service = new S3Service()
            this.userRepository = new UserRepository()
            this.postRepository = new PostRepository()
            this.commentRepository = new CommentRepository()
        }

    async createComment( {postId}: createCommentParamsDTO  ,{ content , files , tags}: createCommentBodyDTO , user : HydratedDocument<IUser>): Promise<IComment>{
        
        const post = await this.postRepository.findOne({
            filter:{
                _id : postId,
                $or:getAvailability(user)

            }

        })
        if(!post){
            throw new NotFoundException("Fail to find matched post‼️")
        }

        let folderId = post.folderId
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

        const comment = await this.commentRepository.createOne({

            data:{
                createdBy:user._id ,
                content:content as string ,
                attachments ,
                postId: post._id ,
                tags :  mentions
            }
        })

        if (!comment) {
            if (attachments.length > 0) {
                await this.s3Service.deleteAssets({
                    Keys: attachments.map(ele => ({ Key: ele }))
                })
            }
            throw new BadRequestException("Fail to create this post ✖️")
        }
        return comment.toJSON()
    }


    async createReplyOnComment( {postId , commentId}: createReplyOnParamsDTO ,{ content , files , tags}: createCommentBodyDTO , user : HydratedDocument<IUser>): Promise<IComment>{
        
        const comment = await this.commentRepository.findOne({
            filter:{
                _id : commentId,
                postId: postId 
            },
            options:{
                populate:[{path :"postId" , match:{ $or:getAvailability(user)}}]

            }

        })
        if(!comment?.postId){
            throw new NotFoundException("Fail to find matched post‼️")
        }

        const post = comment.postId as HydratedDocument<IPost>
        let folderId = post.folderId
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

        const reply = await this.commentRepository.createOne({

            data:{
                createdBy:user._id ,
                content:content as string ,
                attachments ,
                postId: post._id ,
                commentId: comment._id,
                tags :  mentions
            }
        })

        if (!reply) {
            if (attachments.length > 0) {
                await this.s3Service.deleteAssets({
                    Keys: attachments.map(ele => ({ Key: ele }))
                })
            }
            throw new BadRequestException("Fail to reply on this post ✖️")
        }
        
        return reply.toJSON()
    }

}
export const commentService = new CommentService()
