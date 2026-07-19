import { HydratedDocument,  Types } from "mongoose";
import { createCommentBodyDTO, createCommentParamsDTO, createReplyOnParamsDTO} from "./comment.dto";
import { IComment, IPost, IUser } from "../../common/interfaces";
import {   S3Service } from "../../common/service";
import { PostRepository, UserRepository } from "../../DB/repository";
import { BadRequestException, NotFoundException } from "../../common/exception";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { getAvailability } from "../../common/utils/post";
import { notificationService } from "../../common/service/notification.service";
import { NotificationTypeEnum } from "../../common/enums/notification.enum";
import { DeleteCommentParamsDTO, RestoreCommentParamsDTO } from "./comment.validation";


class CommentService {
    private readonly s3Service: S3Service
    private readonly userRepository: UserRepository
    private readonly postRepository: PostRepository
    private readonly commentRepository: CommentRepository
    private readonly notificationService = notificationService;
        constructor(){
            
            this.s3Service = new S3Service()
            this.userRepository = new UserRepository()
            this.postRepository = new PostRepository()
            this.commentRepository = new CommentRepository()
            this.notificationService = notificationService
        }

    async createComment(
        { postId }: createCommentParamsDTO,
        { content, files, tags }: createCommentBodyDTO,
        user: HydratedDocument<IUser>
    ): Promise<IComment> {

        const post = await this.postRepository.findOne({
            filter: {
                _id: postId,
                $or: getAvailability(user)
            }
        });

        if (!post) {
            throw new NotFoundException("Fail to find matched post‼️");
        }

        const folderId = post.folderId;

        const mentions: Types.ObjectId[] = [];

        if (tags?.length) {

            tags = [...new Set(tags)];

            const matchedTags = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            });

            if (matchedTags.length !== tags.length) {
                throw new NotFoundException("Fail to find Match account ✖️");
            }

            for (const tag of tags) {
                mentions.push(Types.ObjectId.createFromHexString(tag));
            }
        }

        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this.s3Service.uploadAssets({
                files,
                path: `Post/${folderId}`
            }) || [];
        }

        const comment = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                postId: post._id,
                tags: mentions
            }
        });

        if (!comment) {

            if (attachments.length) {
                await this.s3Service.deleteAssets({
                    Keys: attachments.map(key => ({ Key: key }))
                });
            }

            throw new BadRequestException("Fail to create this comment ✖️");
        }

        // Notification لصاحب البوست
        await this.notificationService.notify({
            receiverId: post.createdBy.toString(),
            senderId: user._id.toString(),
            type: NotificationTypeEnum.comment,
            title: "New Comment",
            message: `${user.username} commented on your post.`,
            postId: post._id.toString(),
            commentId: comment._id.toString()
        });

        // Notifications للـ Mentions
        if (tags?.length) {

            for (const tag of tags) {

                await this.notificationService.notify({
                    receiverId: tag,
                    senderId: user._id.toString(),
                    type: NotificationTypeEnum.mention,
                    title: "Mention",
                    message: `${user.username} mentioned you in a comment.`,
                    postId: post._id.toString(),
                    commentId: comment._id.toString()
                });
            }
        }

        return comment.toJSON();
    }
        async createReplyOnComment(
        { postId, commentId }: createReplyOnParamsDTO,
        { content, files, tags }: createCommentBodyDTO,
        user: HydratedDocument<IUser>
    ): Promise<IComment> {

        const comment = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                postId
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        match: { $or: getAvailability(user) }
                    }
                ]
            }
        });

        if (!comment?.postId) {
            throw new NotFoundException("Fail to find matched post‼️");
        }

        const post = comment.postId as HydratedDocument<IPost>;
        const folderId = post.folderId;

        const mentions: Types.ObjectId[] = [];

        if (tags?.length) {

            tags = [...new Set(tags)];

            const matchedTags = await this.userRepository.find({
                filter: {
                    _id: { $in: tags }
                }
            });

            if (matchedTags.length !== tags.length) {
                throw new NotFoundException("Fail to find Match account ✖️");
            }

            for (const tag of tags) {
                mentions.push(Types.ObjectId.createFromHexString(tag));
            }
        }

        let attachments: string[] = [];

        if (files?.length) {
            attachments = await this.s3Service.uploadAssets({
                files,
                path: `Post/${folderId}`
            }) || [];
        }

        const reply = await this.commentRepository.createOne({
            data: {
                createdBy: user._id,
                content: content as string,
                attachments,
                postId: post._id,
                commentId: comment._id,
                tags: mentions
            }
        });

        if (!reply) {

            if (attachments.length) {
                await this.s3Service.deleteAssets({
                    Keys: attachments.map(key => ({ Key: key }))
                });
            }

            throw new BadRequestException("Fail to reply on this post ✖️");
        }

        // Notification لصاحب التعليق
        await this.notificationService.notify({
            receiverId: comment.createdBy.toString(),
            senderId: user._id.toString(),
            type: NotificationTypeEnum.reply,
            title: "New Reply",
            message: `${user.username} replied to your comment.`,
            postId: post._id.toString(),
            commentId: comment._id.toString(),
            replyId: reply._id.toString()
        });

        // Notifications للـ Mentions
        if (tags?.length) {

            for (const tag of tags) {

                await this.notificationService.notify({
                    receiverId: tag,
                    senderId: user._id.toString(),
                    type: NotificationTypeEnum.mention,
                    title: "Mention",
                    message: `${user.username} mentioned you in a reply.`,
                    postId: post._id.toString(),
                    commentId: comment._id.toString(),
                    replyId: reply._id.toString()
                });
            }
        }

        return reply.toJSON();
    }


      async deleteComment(
    { commentId }: DeleteCommentParamsDTO,
    user: HydratedDocument<IUser>
): Promise<void> {

    const comment = await this.commentRepository.findOne({
        filter: {
            _id: commentId,
            createdBy: user._id
        }
    });

    if (!comment) {
        throw new NotFoundException("Failed to find matching comment.");
    }

    await this.notificationService.deleteCommentNotification(commentId);

    await this.commentRepository.updateOne({
        filter: {
            _id: commentId,
            createdBy: user._id
        },
        update: {
            deletedAt: new Date()
        }
    });
}
    async restoreComment(
    { commentId }: RestoreCommentParamsDTO,
    user: HydratedDocument<IUser>
): Promise<IComment> {

    const comment = await this.commentRepository.findOne({
        filter: {
            _id: commentId,
            createdBy: user._id,
            paranoid: false
        } as any
    });

    if (!comment) {
        throw new NotFoundException("Failed to find matching comment.");
    }

    if (!comment.deletedAt) {
        throw new BadRequestException("Comment is not deleted.");
    }

    const restoredComment = await this.commentRepository.findOneAndUpdate({
        filter: {
            _id: commentId,
            createdBy: user._id,
            paranoid: false
        } as any,
        update: {
            restoredAt: new Date(),
            $unset: {
                deletedAt: 1
            }
        }
    });

    return restoredComment!;
}



}
export const commentService = new CommentService()
