import userService, { UserService } from "../user.service"
import { IChat, IUser } from "../../../common/interfaces"
import { endPoints, isAuthorized } from "../../../middleware"
import { IAuthUser } from "../../../common/types/express.types"
import { HydratedDocument } from "mongoose"



export class UserResolver {
    private userService : UserService
    constructor(){
        this.userService = userService

    }
    Profile = async (
    parent: unknown, 
    args: any, 
    { user }: IAuthUser
): Promise<{ message: string, data: { user: IUser, groups: HydratedDocument<IChat>[] } }> => {
    
    await isAuthorized(endPoints.profile, user);
    
    const data = await this.userService.profile(user);
    return {
        message: "HI",
        data  
    }
}
}
export const userResolver = new UserResolver()