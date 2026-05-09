import userService, { UserService } from "../user.service"
import { IUser } from "../../../common/interfaces"
import { endPoints, isAuthorized } from "../../../middleware"

export interface IAuthUser {
    user?: IUser | null;
}

export class UserResolver {
    private userService : UserService
    constructor(){
        this.userService = userService

    }
    // {user}:IAuthUser  ❌
    Profile= async (parent : unknown , args :any , {user}:IAuthUser ): Promise<{message : string , data : IUser} >=> {
        // authentication 
        //authorization
        //validation
        
    await isAuthorized(endPoints.profile, user )
    const data = await this.userService.profile(user)
                    return {
                            message: "HI" , data 
                        }
                }
}
export const userResolver = new UserResolver()