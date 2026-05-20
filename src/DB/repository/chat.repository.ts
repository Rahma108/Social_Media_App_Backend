
import { HydratedDocument, PopulateOptions, ProjectionType, QueryFilter, QueryOptions } from "mongoose";
import { IChat } from "../../common/interfaces";
import { ChatModel} from "../models";
import { BaseRepository } from "./base.repository";


export class ChatRepository extends BaseRepository<IChat> {

    constructor(){
        super(ChatModel)

    }

        async findOneChat({
            page = 1, size = 1,
            filter={},
            projection,
            options
            }: {
            page? : number ,
            size? :number,
            filter?: QueryFilter<IChat>;
            projection?: ProjectionType<IChat> | null | undefined;
            options?: QueryOptions<IChat>
            }) : Promise<  HydratedDocument<IChat> | null>{


            const doc = await this.model
            .findOne(filter, {
                messages: { $slice: [- (page * size ) ,  size ] },
            } as ProjectionType<IChat>)
            .populate((options?.populate as PopulateOptions[]) || []);
            console.log(doc);

            return doc

        

}}

