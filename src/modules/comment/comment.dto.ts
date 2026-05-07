import {z}  from 'zod'
import { createComment, createReplyOnComment} from './comment.validation'

export type createCommentBodyDTO = z.infer<typeof createComment.body>
export type createCommentParamsDTO = z.infer<typeof createComment.params>
export type createReplyOnParamsDTO = z.infer<typeof createReplyOnComment.params>