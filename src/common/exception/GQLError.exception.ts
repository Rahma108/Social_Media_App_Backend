import { GraphQLError } from "graphql"

export const GQLError = (error : any )=>{
    throw new GraphQLError(error.message || 'internal Server Error' , {
        extensions: {status , error } ////
    })   

}