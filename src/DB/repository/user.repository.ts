
import { IUser } from "../../common/interfaces";
import { UserModel } from "../models";
import { BaseRepository } from "./base.repository";


export class UserRepository extends BaseRepository<IUser> {

    constructor(){
        super(UserModel)

    }

}