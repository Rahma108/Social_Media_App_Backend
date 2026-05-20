
import {  model, models  , Schema, Types }  from "mongoose";
import { IChat, IMessage } from "../../common/interfaces";

const chatMessagesSchema = new Schema<IMessage>({
    content:{type :String , minLength: 2 , maxLength: 500000 , required : function(this){
        return !this.attachments?.length

    }},
    attachments:{type : String},
    likes:[{type : Types.ObjectId , ref : "User"   }],
    createdBy:[{type : Types.ObjectId , ref : "User" , required:true  }],
    tags:[{type : Types.ObjectId , ref : "User"   }],

} , {
    timestamps:true ,
    strict:true ,
    strictQuery:true , 
    toJSON:{virtuals:true} ,
    toObject:{virtuals:true}

} )



const chatSchema = new Schema<IChat>({

    //OVM
    group_image:{type:String , required:function(this){
        return this.type =="ovm"
    }},
    group_name:{type:String , required:function(this){
        return this.type =="ovm"
    }},

    roomId:{type:String , required:function(this){
        return this.type == "ovm"
    }},

    messages:[chatMessagesSchema],

    type :{type : String , enum :["ovo" , "ovm"]},
    participants:[{type : Types.ObjectId , ref : "User"  , required:true }],

    createdBy : {type : Types.ObjectId , ref : "User" , required: true  },
    deletedAt: {type:Date } ,
    restoredAt: {type:Date }

} , {
    timestamps:true ,
    collection:"chat" ,
    strict:true ,
    strictQuery:true , 
    toJSON:{virtuals:true} ,
    toObject:{virtuals:true}

} )

export const  ChatModel = models['Chat'] || model<IChat>("Chat", chatSchema);
ChatModel.syncIndexes()