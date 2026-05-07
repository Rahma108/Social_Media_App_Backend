import { connect } from "mongoose"
import { DB_URI } from "../config/config"
import { UserModel } from "./models"


export const connectDB = async()=>{
    try {
        await connect( DB_URI , {serverSelectionTimeoutMS : 30000})
        await UserModel.syncIndexes()
        console.log(`DB Connected Successfully 😎`)
    } catch (error) {
        console.log(`Fail To Connect On DB ${error} 🫠`)
    }



}