
import { IPost  } from "../../common/interfaces";
import { PostModel } from "../models/post.model";
import { BaseRepository } from "./base.repository";


export class PostRepository extends BaseRepository<IPost> {

    constructor(){
        super(PostModel)

    }

}