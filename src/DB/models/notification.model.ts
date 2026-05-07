
import {  HydratedDocument, model, models  , Schema}  from "mongoose";
import { IUser } from "../../common/interfaces";
import { INotification } from "../../common/interfaces/notification.interface";
import { NotificationTypeEnum } from "../../common/enums/notification.enum"; 


const notificationSchema = new Schema<INotification>({
        receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
        },

        senderId: {
        type:Schema.Types.ObjectId,
        ref: "User"
        },

        type: {
        type: String,
        enum:  NotificationTypeEnum,
        required: true
        },
        message: String,

        postId: {
        type: Schema.Types.ObjectId,
        ref: "Post"
        },

        isRead: {
        type: Boolean,
        default: false
        },
        deletedAt: { type: Date }

}, {
    timestamps:true ,
    collection:"Notification" ,
    strict:true ,
    strictQuery:true , 
    toJSON:{virtuals:true} ,
    toObject:{virtuals:true}

} )
notificationSchema.pre(["findOne" , "find" , "countDocuments"], async function(){
    const query = this.getQuery()
    if(query['paranoid']  === false ){
        this.setQuery({...query})
    }else{
        this.setQuery({...query , deletedAt:{$exists:false }})
    }
    
})

notificationSchema.pre( ["updateOne" , "findOneAndUpdate"], async function(){
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

notificationSchema.pre( ["deleteOne" , "findOneAndDelete"], async function(){
    
    const query = this.getQuery()
    if(query['force']  === true  ){
        this.setQuery({...query})
    }else{
        this.setQuery({  deletedAt:{$exists: true } , ...query })
    }
    
})


export const  NotificationModel = models['Notification'] || model<INotification>("Notification", notificationSchema);