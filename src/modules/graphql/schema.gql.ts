import {  GraphQLObjectType, GraphQLSchema} from "graphql";
import { userGQLSchema } from "../user";
import { postGQLSchema } from "../post";

        const  query =  new GraphQLObjectType({
                name: "RootQuerySchema",

                fields: {
                    ...userGQLSchema.registerQuery(),
                    ...postGQLSchema.registerQuery(),
                    

                },

}) 
        const mutation =  new GraphQLObjectType({
                name: "RootMutationSchema",

                fields: {
                    ...userGQLSchema.registerMutation()

                
            }})
export const schema = new GraphQLSchema({query , mutation});