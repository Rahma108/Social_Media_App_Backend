import { HydratedDocument } from "mongoose"
import userService, { UserService } from "../user.service"
import { IUser } from "../../../common/interfaces"

export class UserResolver {
    private userService : UserService
    constructor(){
        this.userService = userService

    }
    welcome = async (parent : unknown , args :{search?:string})=> {
        // authentication 
        //authorization
        //validation

    const data = await this.userService.profile({} as HydratedDocument<IUser>)
                    return {
                            message: "HI" , data 
                        }
                }
}
export const userResolver = new UserResolver()