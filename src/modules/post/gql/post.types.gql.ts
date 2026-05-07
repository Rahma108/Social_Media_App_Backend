import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

export const postList = new GraphQLObjectType({
    name : "postListResponse" ,
    fields :{
        message : {type : new GraphQLNonNull(GraphQLString) } ,

    }
})