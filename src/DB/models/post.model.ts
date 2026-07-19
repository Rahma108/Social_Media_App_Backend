
import {  model, models  , Schema, Types }  from "mongoose";
import { IPost } from "../../common/interfaces";
import { AvailabilityEnum, ReactEnum } from "../../common/enums";


const postSchema = new Schema<IPost>({

    folderId: {type : String , required: true } ,
    content: {type : String , required: function(this){
        return this.attachments?.length


    }} ,
    attachments: {type : [String]  } ,
    tags : [{type : Types.ObjectId , ref : "User"  }],
    reactions: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
            type: {
                    type: Number,
                    enum: Object.values(ReactEnum).filter(
                        (value): value is number => typeof value === "number"
                    ),
                    required: true
                }
            }
        ],

    availability: {type : Number , enum: AvailabilityEnum , default : AvailabilityEnum.PUBLIC },
    createdBy : {type : Types.ObjectId , ref : "User" , required: true  },
    updatedBy : {type : Types.ObjectId , ref : "User"  },

    deletedAt: {type:Date } ,
    restoredAt: {type:Date }

} , {
    timestamps:true ,
    collection:"Posts" ,
    strict:true ,
    strictQuery:true , 
    toJSON:{virtuals:true} ,
    toObject:{virtuals:true}

} )
// post relation with comment
postSchema.virtual("comments" , {
    localField:"_id" ,
    foreignField:"postId",
    ref:"Comment",  // 
    justOne: false 
})
postSchema.pre(["findOne" , "find" , "countDocuments"], async function(){
    const query = this.getQuery()
    if(query['paranoid']  === false ){
        this.setQuery({...query})
    }else{
        this.setQuery({...query , deletedAt:{$exists:false }})
    }
    
})
postSchema.pre(["updateOne", "findOneAndUpdate"], function () {

    const update = this.getUpdate() as any;
    const query = this.getQuery();

    if (update.deletedAt) {
        this.setUpdate({
            ...update,
            $unset: {
                restoredAt: 1
            }
        });
    }

    if (update.restoredAt) {
        this.setUpdate({
            ...update,
            $unset: {
                deletedAt: 1
            }
        });

        this.setQuery({
            ...query,
            deletedAt: { $exists: true }
        });
    } else if (query['paranoid'] !== false) {
        this.setQuery({
            ...query,
            deletedAt: { $exists: false }
        });
    }

});

postSchema.pre( ["deleteOne" , "findOneAndDelete"], async function(){
    
    const query = this.getQuery()
    if(query['force']  === true  ){
        this.setQuery({...query})
    }else{
        this.setQuery({  deletedAt:{$exists: true } , ...query })
    }
    
})


export const  PostModel = models['Post'] || model<IPost>("Post", postSchema);