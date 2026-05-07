
import {MongooseUpdateQueryOptions ,UpdateQuery, AnyKeys, CreateOptions, FlattenMaps, HydratedDocument, Model, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, Types, UpdateWithAggregationPipeline,UpdateWriteOpResult, DeleteResult } from "mongoose";
import { IPaginate } from "../../common/types/pagination.types";

export abstract  class BaseRepository<TRawDocument> {

    constructor(protected readonly  model : Model<TRawDocument>){

    }
    // Overloading ...............
    create( {data } :{data: AnyKeys<TRawDocument>} )  //  Prototype CreateOne
    :Promise<HydratedDocument<TRawDocument>>    

    create( {data , options} :{data: AnyKeys<TRawDocument>[] , options?:CreateOptions} )  // Prototype Create
    :Promise<HydratedDocument<TRawDocument> [] > 

    create( {data , options} :{data: AnyKeys<TRawDocument>[] | AnyKeys<TRawDocument> , options?:CreateOptions} )
    :Promise<HydratedDocument<TRawDocument> [] | HydratedDocument<TRawDocument> > {
        return this.model.create(data as any  , options)
    }
    
    async createOne({
        data,
        options = {} 
        }: {
        data: Partial<TRawDocument>,
        options?: CreateOptions | undefined
        }): Promise<HydratedDocument<TRawDocument>> {

        const [doc ] = await  this.create({data: [ data] , options : options }) || []
        return doc  as HydratedDocument<TRawDocument>
        }
    
    async findOne({
        filter,
        projection,
        options,
        }: {
        filter: QueryFilter<TRawDocument>;
        projection?: ProjectionType<TRawDocument> | null | undefined;
        options?: QueryOptions<TRawDocument> & {lean?: false, populate ?:PopulateOptions[]}
        }) : Promise<HydratedDocument<TRawDocument> | null>
    async findOne({
        filter,
        projection,
        options,
        }: {
        filter: QueryFilter<TRawDocument>;
        projection?: ProjectionType<TRawDocument> | null | undefined;
        options?: QueryOptions<TRawDocument>  & {lean? : true }
        }) : Promise< FlattenMaps<TRawDocument> | null>

        async findOne({
        filter={},
        projection,
        options,
        }: {
        filter: QueryFilter<TRawDocument>;
        projection?: ProjectionType<TRawDocument> | null | undefined;
        options?: QueryOptions<TRawDocument>
        }) : Promise< FlattenMaps<TRawDocument> | HydratedDocument<TRawDocument> | null>{
        const doc =  this.model.findOne(filter , projection  , options);
        if(options?.lean){
            doc.lean()
        }
        if(options?.populate) doc.populate(options.populate as PopulateOptions[])
        return await doc.exec()
    }
    async findById({
        _id,
        projection,
        options,
        }: {
        _id: Types.ObjectId;
        projection?: ProjectionType<TRawDocument> | null | undefined;
        options?: QueryOptions<TRawDocument> & {lean : false}
        }) : Promise<HydratedDocument<TRawDocument> | null>
    async findById({
        _id,
        projection,
        options,
        }: {
        _id: Types.ObjectId;
        projection?: ProjectionType<TRawDocument> | null | undefined;
        options?: QueryOptions<TRawDocument>  & {lean : true }
        }) : Promise< FlattenMaps<TRawDocument> | null>


    async findById({
        _id,
        projection,
        options,
        }: {
        _id: Types.ObjectId;
        projection?: ProjectionType<TRawDocument> | null | undefined;
        options?: QueryOptions<TRawDocument>
        }) : Promise< FlattenMaps<TRawDocument> | HydratedDocument<TRawDocument> | null>{
        const doc =  this.model.findById( _id , projection);
        if(options?.lean){
            doc.lean()
        }
        if(options?.populate) doc.populate(options.populate as PopulateOptions[])
        return await doc.exec()
}
    async find({
        filter , projection, options }: {filter?:QueryFilter<TRawDocument>
            , projection?:ProjectionType<TRawDocument>| null | undefined,
            options?:QueryOptions<TRawDocument>| null | undefined } ) {
            const doc = this.model.find(filter ,projection );

        if (options?.populate) {
            doc.populate(options.populate as  PopulateOptions[] ) ;
        }

        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.skip) {
            doc.skip(options.skip  ) ;
        }
        if (options?.limit) {
            doc.limit(options.limit) ;
        }
        return doc.exec();
    }


    async paginate({
        filter = {},
        options = {},
        projection,
        page = undefined,
        size = 5
    }: {
        filter?:QueryFilter<TRawDocument>,
        options?: QueryOptions<TRawDocument> & {skip?:number , limit?:number },
        projection?:ProjectionType<TRawDocument> | null | undefined,
        page?: string | number |  undefined ,
        size?: string | number |  undefined,
    }):Promise<IPaginate<TRawDocument>> {

        let count = 0
        if (Number(page) > 0 ) {
            page = parseInt(page as string)
            size = parseInt(size as string)
            options.skip = (page -1 ) * size
            options.limit =  size
            count = await this.model.countDocuments(filter)
        }

        const docs = await this.find({projection , filter: filter || {} , options });

        return {
        docs,
        currentPage : Number(page)  ,
        pageSize : page ? Number(size) : undefined ,
        pages: page ? Math.ceil(count / Number(size)) : undefined
        }
    }
    async insertMany ({
        data,
        }: {
        data: AnyKeys<TRawDocument>[];
        }): Promise<HydratedDocument<TRawDocument>[] > {
        return await this.model.insertMany(data as  any ) as HydratedDocument<TRawDocument>[]
    }
    async updateOne({
        filter = {},
        update ,
        options
    } :{
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<TRawDocument>
    } 
    ):Promise<UpdateWriteOpResult>{
        return await this.model.updateOne(filter ,{...update , $incr:{_v: 1}} , options )
    }

    async updateMany({
        filter = {},
        update,
        options
    } :{
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<TRawDocument>
    } 
    ):Promise<UpdateWriteOpResult>{
        return await this.model.updateMany(filter , {...update , $incr:{_v: 1}} , options )
    }

    async deleteOne({
        filter ={},
    } :{
        filter: QueryFilter<TRawDocument>,
    } 
    ):Promise<DeleteResult>{
        return await this.model.deleteOne(filter)
    }

    async deleteMany({
        filter={} ,
    } :{
        filter: QueryFilter<TRawDocument>,
    } 
    ):Promise<DeleteResult>{
        return await this.model.deleteMany(filter)
    }

async findOneAndUpdate({ filter = {}, update, options } : {
    filter: QueryFilter<TRawDocument>,
    update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
    options?: MongooseUpdateQueryOptions<TRawDocument>
}): Promise<HydratedDocument<TRawDocument> | null> {

    if (Array.isArray(update)) {
        return await this.model.findOneAndUpdate(
            filter,
            [...update, { $set: { __v: { $add: ["$__v", 1] } } }], 
            { ...options, new: true , updatePipeline: true }           
        )
    }

    return await this.model.findOneAndUpdate(
        filter,
        { ...update, $inc: { __v: 1 } },
        { ...options, new: true }                 
    )
}

    async findByAndUpdate({
        _id,
        update,
        options
    } :{
        _id : Types.ObjectId ,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: MongooseUpdateQueryOptions<TRawDocument>
    } 
    ):Promise<HydratedDocument<TRawDocument> | null >{
        return await this.model.findByIdAndUpdate(_id , {...update , $incr:{_v: 1}}  , options )
    }

    async findOneAndDelete({
        filter = {},
        options
    } :{
        filter: QueryFilter<TRawDocument>,
        options?: QueryOptions<TRawDocument>
    } 
    ):Promise<HydratedDocument<TRawDocument> | null >{
        return await this.model.findOneAndDelete(filter , options )
    }
    async findByIdAndDelete({
    _id ,
        options
    } :{
        _id : Types.ObjectId ,
        options?: QueryOptions<TRawDocument>
    } 
    ):Promise<HydratedDocument<TRawDocument> | null >{
        return await this.model.findByIdAndDelete(_id , options )
    }

}
