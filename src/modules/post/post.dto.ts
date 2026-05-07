import {z}  from 'zod'
import { createPost, reactPost, updatePost } from './post.validation'

export type createPostBodyDTO = z.infer<typeof createPost.body>
export type UpdatePostBodyDTO = z.infer<typeof updatePost.body>
export type UpdatePostParamsDTO = z.infer<typeof updatePost.params>
export type ReactPostParamsDTO = z.infer<typeof reactPost.params>
export type ReactPostQueryDTO = z.infer<typeof reactPost.query>
