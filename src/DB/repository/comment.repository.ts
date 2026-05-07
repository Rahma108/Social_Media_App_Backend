
import { IComment } from "../../common/interfaces";
import { CommentModel } from "../models";
import { BaseRepository } from "./base.repository";


export class CommentRepository extends BaseRepository<IComment> {

    constructor(){
        super(CommentModel)

    }

}