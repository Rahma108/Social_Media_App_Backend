
import  * as PostGQLTypes from './post.types.gql'
import  * as PostGQLArgs from './post.args.gql'
import { postResolver, PostResolver } from './post.resolver'

export class PostGQLSchema {
    private postResolver : PostResolver
    constructor(){
        this.postResolver  = postResolver

    }
    registerQuery(){
        return {
            postList :{
                type : PostGQLTypes.postList,
                args : PostGQLArgs.PostList,
                resolve : this.postResolver.postList,
            }

        }
    }



}

export const postGQLSchema = new PostGQLSchema()