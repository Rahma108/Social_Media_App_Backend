
import { postService ,  PostService } from '../post.service'
import { IPost, IUser} from '../../../common/interfaces'
import { graphQLValidation } from '../../../middleware'
import { paginationValidationSchema } from '../../../common/validation'
import { reactGraphQLPost } from '../post.validation'
import { IPaginate } from '../../../common/types/pagination.types'
export interface IAuthUser {
    user?: IUser | null;
}
export class PostResolver {
    private postService : PostService
    constructor(){
        this.postService = postService

    }
    postList = async (parent : unknown  , args : {page ?:number , size ?:number , search?:string}  , { user }: IAuthUser):Promise<{message : string , data:IPaginate<IPost>}>=>{
        
        await graphQLValidation<{page ?:number , size ?:number , search?:string}>(paginationValidationSchema.query , args)
        const data = await this.postService.listPost(args, user )
        return {message : "Done" , data} 

    }

    reactOnPost = async (parent : unknown  , {postId , react}: {postId : string , react : number  }  , { user }: IAuthUser):Promise<{message : string , data:IPost}>=>{
        
        await graphQLValidation<{postId : string , react : number  }>(reactGraphQLPost ,  {postId , react})
        const data = await this.postService.reactOnPost( {postId } ,{react}, user )
        return {message : "Done" , data} 

    }
}
export const postResolver = new PostResolver()