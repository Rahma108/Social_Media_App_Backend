import { HydratedDocument } from 'mongoose'
import { postService ,  PostService } from '../post.service'
import { IUser } from '../../../common/interfaces'
export class PostResolver {
    private postService : PostService
    constructor(){
        this.postService = postService

    }
    postList = async (parent : unknown  , args : any )=>{
        const data = await this.postService.listPost({} , {} as HydratedDocument<IUser>)
        return {message : "Done" , data} 

    }
}
export const postResolver = new PostResolver()