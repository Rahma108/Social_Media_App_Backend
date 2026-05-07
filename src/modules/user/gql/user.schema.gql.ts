import {  GraphQLString } from "graphql";
import * as UserGQLTypes from "./user.types.gql";
import * as UserGQLArgs from "./user.args.gql";
import { userResolver, UserResolver } from "./user.resolver";
export class UserGQLSchema {
    private userResolver : UserResolver
    constructor(){
        this.userResolver = userResolver

    }
    // Fields
    registerQuery(){
        return {
            profile:{
                type: UserGQLTypes.profile,
                args:UserGQLArgs.welcome ,
                description:"Test Welcome Point" ,
                resolve :this.userResolver.welcome

            }
        }


    }

    registerMutation(){
        return {
            like :{
                type:GraphQLString ,
                description:"Test Welcome Point" ,
                resolve :()=>{
                    return `HI`
                }

            }
        }


    }



}
export const userGQLSchema = new UserGQLSchema()