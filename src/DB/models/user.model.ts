
import { HydratedDocument, model, models  , Schema, Types }  from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums";
import { IUser } from "../../common/interfaces";
import { BadRequestException } from "../../common/exception";
import { encrypt, generateHash } from "../../common/utils/security";

const userSchema = new Schema<IUser>({

    firstName : {type : String , required: true } ,
    lastName : {type : String , required: true } ,
    email: {type : String , required: true  , unique: true } ,
    password: {type : String , required: function(this){
        return this.provider  == ProviderEnum.SYSTEM
    } },
    bio: {type : String , required: false , maxLength: 200 },
    slug:{type : String , required: true }  ,
    DOB: {type : Date , required: false } ,
    confirmedAt :{type : Date , required: false },
        gender : { 
        type: Number,   
        enum: Object.values(GenderEnum).filter(v => typeof v === "number"),
        default: GenderEnum.MALE
        },
        friends:[{type : Types.ObjectId , ref :"User"}],
        role : { 
        type: Number,  
        enum: Object.values(RoleEnum).filter(v => typeof v === "number"),
        default: RoleEnum.USER
        },
    phone :  {type : String , required: true} ,
    profileImage: {type : String , required: false },
    coverImages: {type : [String] , required: false },
    changeCredentialTime:{type:Date } ,
    confirmEmail : {type:Date } ,
    provider: {type :  Number , enum :Object.values(ProviderEnum).filter(v => typeof v === "number") ,  
        default: ProviderEnum.SYSTEM} ,
    extra : {
        name : String
    } ,

    deletedAt: { type: Date, default: null },
    restoredAt: {type:Date }

} , {
    timestamps:true ,
    collection:"users" ,
    strict:true ,
    strictQuery:true , 
    toJSON:{virtuals:true} ,
    toObject:{virtuals:true}

} )


userSchema.virtual('username').get(function(this:IUser){
    return `${this.firstName} ${this.lastName}`

}).set(function(this:IUser , value: string ){
        const [firstName , lastName] =value.split(" ")
        this.firstName = firstName  as string
        this.lastName = lastName  as string
        this.slug = value.replaceAll(/\s+/g , "-") 

})

userSchema.pre("validate" ,async function(){ 
        console.log("Pre Validate"  ) 
        if( this.password && this.provider == ProviderEnum.GOOGLE ){
            throw new BadRequestException("Google Account Cannot hold password ❌")

        }
        if(this.phone && this.isModified("phone")){
            this.phone = await encrypt(this.phone);
        }
        if(this.password && this.isModified("password")){
            this.password = await generateHash({plaintext :this.password });
        }

})

userSchema.pre(["findOne" , "find"], async function(){
    const query = this.getQuery()
    if(query['paranoid']  === false ){
        this.setQuery({...query})
    }else{
        this.setQuery({...query , deletedAt:{$exists:false }})
    }
    
})

userSchema.pre( ["deleteOne" , "findOneAndDelete"], async function(){
    
    const query = this.getQuery()
    if(query['force']  === true  ){
        this.setQuery({...query})
    }else{
        this.setQuery({  deletedAt:{$exists: true } , ...query })
    }
    
})

userSchema.pre( ["updateOne" , "findOneAndUpdate"], async function(){
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



export const UserModel = models['User'] || model<IUser>("User", userSchema);