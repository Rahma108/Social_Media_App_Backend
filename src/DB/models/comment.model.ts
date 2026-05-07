
import {  HydratedDocument, model, models  , Schema, Types }  from "mongoose";
import { IComment,  IUser } from "../../common/interfaces";

const commentSchema = new Schema<IComment>({
    content: {type : String , required: function(this){
        return this.attachments?.length


    }} ,
    attachments: {type : [String]  } ,
    tags : [{type : Types.ObjectId , ref : "User"  }],
    likes : [{type : Types.ObjectId , ref : "User"  }],

    commentId: {type : Types.ObjectId , ref : "Comment"  },
    postId: {type : Types.ObjectId , ref : "Post" , required: true  },

    createdBy : {type : Types.ObjectId , ref : "User" , required: true  },
    updatedBy : {type : Types.ObjectId , ref : "User"  },

    deletedAt: {type:Date } ,
    restoredAt: {type:Date }

} , {
    timestamps:true ,
    collection:"Comments" ,
    strict:true ,
    strictQuery:true , 
    toJSON:{virtuals:true} ,
    toObject:{virtuals:true}

} )

commentSchema.virtual("reply", {
    localField: "commentId",   
    foreignField: "_id",     
    ref: "Comment",
    justOne: true
})
commentSchema.pre(["findOne" , "find" , "countDocuments"], async function(){
    const query = this.getQuery()
    if(query['paranoid']  === false ){
        this.setQuery({...query})
    }else{
        this.setQuery({...query , deletedAt:{$exists:false }})
    }
    
})

commentSchema.pre( ["updateOne" , "findOneAndUpdate"], async function(){
    const update = this.getUpdate() as HydratedDocument<IUser>
    if(update.deletedAt){
        this.setUpdate({...update , $unset:{restoredAt :  1 }})
    }
    if(update.restoredAt){
        this.setUpdate({...update , $unset:{deletedAt:  1 }})
        this.setUpdate({...this.getQuery() ,deletedAt:{$exists: true  } })
    }
    console.log(update)
    const query = this.getQuery()
    if(query['paranoid']  === false ){
        this.setQuery({...query})
    }else{
        this.setQuery({  deletedAt:{$exists:false } , ...query })
    }
    
})

commentSchema.pre( ["deleteOne" , "findOneAndDelete"], async function(){
    
    const query = this.getQuery()
    if(query['force']  === true  ){
        this.setQuery({...query})
    }else{
        this.setQuery({  deletedAt:{$exists: true } , ...query })
    }
    
})


export const  CommentModel = models['Comment'] || model<IComment>("Comment", commentSchema);