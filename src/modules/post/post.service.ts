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
import { notificationService } from "../../common/service/notification.service";
import { NotificationTypeEnum } from "../../common/enums/notification.enum";
import { ReactEnum } from "../../common/enums";
export class PostService {
    private readonly s3Service: S3Service
    private readonly userRepository: UserRepository
    private readonly postRepository: PostRepository
    private readonly notificationService = notificationService;
    private readonly redisService = redisService

        constructor(){
            this.s3Service = new S3Service()
            this.userRepository = new UserRepository()
            this.postRepository = new PostRepository()
            this.notificationService = notificationService
            this.redisService = redisService 
        }

    async listPost({page , size , search } :  PaginationDTO , user : HydratedDocument<IUser>): Promise<IPaginate<IPost>> {
        const posts =  await this.postRepository.paginate({
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
        mentions.push(Types.ObjectId.createFromHexString(tag));

        // FCM 
        (await this.redisService.getFCMs(tag) || []).map(ele => {
            FCM_TOKENS.push(ele)
        })
        
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
              // Save Notifications in Database
            if (mentions.length) {
            await Promise.all(
                mentions.map(receiverId =>
                    this.notificationService.createNotification({
                        receiverId: receiverId.toString(),
                        senderId: user._id.toString(),
                        type: NotificationTypeEnum.mention,
                        message: `${user.username} mentioned you in a post`,
                        postId: post._id.toString()
                    })
                )
            );
        }
        // Send Notification 
        if(FCM_TOKENS.length){
            await this.notificationService.sendMultipleNotification({
                tokens: FCM_TOKENS ,
                data: {
                        title: "Post Mention",
                        body: `${user.username} mentioned you in a post`,
                        postId: post._id.toString()
                    }
            })
        }


        return post.toJSON()
    }
    async updatePost(
    { postId }: UpdatePostParamsDTO,
    {
        availability,
        content,
        files = [],
        tags = [],
        removeFiles = [],
        removeTags = []
    }: UpdatePostBodyDTO,
    user: HydratedDocument<IUser>
): Promise<IPost> {

    const post = await this.postRepository.findOne({
        filter: {
            _id: postId,
            createdBy: user._id
        }
    });

    if (!post) {
        throw new NotFoundException("Failed to find matching post.");
    }

    if (
        !content &&
        !post.content &&
        files.length === 0 &&
        removeFiles.length === post?.attachments?.length
    ) {
        throw new BadRequestException("We cannot leave an empty post.");
    }

    tags = [...new Set(tags)];
    removeTags = [...new Set(removeTags)];

        const mentions: Types.ObjectId[] = [];
        const FCM_TOKENS: string[] = [];

        for (const tag of tags) {

            if (!Types.ObjectId.isValid(tag)) continue;

            mentions.push(new Types.ObjectId(tag));

            const tokens = await redisService.getFCMs(tag) || [];
            FCM_TOKENS.push(...tokens);
        }

    let attachments: string[] = [];

    try {

        if (files.length > 0) {
            attachments = await this.s3Service.uploadAssets({
                files,
                path: `Post/${post.folderId}`
            }) || [];
        }

        const updatedPost = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: post._id,
                createdBy: user._id
            },

            update: [
                {
                    $set: {

                        availability: availability ?? post.availability,

                        content: content ?? post.content,

                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$attachments",
                                        removeFiles
                                    ]
                                },
                                attachments
                            ]
                        },

                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removeTags.map(id => createObjectId(id))
                                    ]
                                },
                                tags.map(id => createObjectId(id))
    
                            ]
                        }

                    }
                }
            ]
        });

        if (!updatedPost) {
            throw new BadRequestException("Failed to update post.");
        }

        if (removeFiles.length) {
            await this.s3Service.deleteAssets({
                Keys: removeFiles.map(file => ({ Key: file }))
            });
        }
        // Notification
        // Send notifications to new mentions
            if (mentions.length) {

            const uniqueTokens = [...new Set(FCM_TOKENS)];

            for (const mention of mentions) {

                // Don't notify yourself
                console.log("Creating notification...");
                if (mention.equals(user._id)) continue;

                        await notificationService.createNotification({
                            receiverId: mention.toString(),
                            senderId: user._id.toString(),
                            type: NotificationTypeEnum.update_post,
                            message: `${user.username} mentioned you in an updated post.`,
                            postId: updatedPost._id.toString()
                        });
                    }

                    if (uniqueTokens.length) {
                        await notificationService.sendMultipleNotification({
                            tokens: uniqueTokens,
                            data: {
                                title: "Post Updated",
                                body: `${user.username} mentioned you in an updated post.`,
                                postId: updatedPost._id.toString()
                            }
                        });
                    }
                }


        return updatedPost.toJSON();

    } catch (error) {

        if (attachments.length) {
            await this.s3Service.deleteAssets({
                Keys: attachments.map(file => ({ Key: file }))
            });
        }

        throw error;
    }
}
    async reactOnPost(
    { postId }: UpdatePostParamsDTO,
    { react }: { react: ReactEnum },
    user: HydratedDocument<IUser>
): Promise<IPost> {

    const reactionMessages: Record<ReactEnum, string> = {
        [ReactEnum.LIKE]: "liked",
        [ReactEnum.LOVE]: "loved",
        [ReactEnum.HAHA]: "laughed at",
        [ReactEnum.WOW]: "was surprised by",
        [ReactEnum.SAD]: "felt sad about",
        [ReactEnum.ANGRY]: "got angry at"
    };

    const post = await this.postRepository.findOne({
        filter: {
            _id: postId,
            $or: getAvailability(user)
        }
    });

    if (!post) {
        throw new NotFoundException("Failed to find matching post.");
    }

        const reactionIndex = post.reactions.findIndex(
            r => r.userId.toString() === user._id.toString()
        );

        const existingReaction =
            reactionIndex >= 0 ? post.reactions[reactionIndex] : undefined;

        if (!existingReaction) {
            post.reactions.push({
                userId: user._id,
                type: react
            });
        } else if (existingReaction.type === react) {
            post.reactions.splice(reactionIndex, 1);
        } else {
            existingReaction.type = react;
        }


    await post.save();

    // ================= Notification =================

    const ownerId = post.createdBy.toString();

    if (ownerId !== user._id.toString()) {

        const reaction = reactionMessages[react] ?? "reacted to";

        await notificationService.createNotification({
            receiverId: ownerId,
            senderId: user._id.toString(),
            type: NotificationTypeEnum.like_post,
            message: `${user.username} ${reaction} your post.`,
            postId: post._id.toString()
        });

        const FCM_TOKENS = [
            ...new Set(await redisService.getFCMs(ownerId) || [])
        ];

        if (FCM_TOKENS.length) {
            await notificationService.sendMultipleNotification({
                tokens: FCM_TOKENS,
                data: {
                    title: "New Reaction",
                    body: `${user.username} ${reaction} your post.`,
                    postId: post._id.toString()
                }
            });
        }
    }

    return post.toJSON();
}
    }
export const postService = new PostService()
