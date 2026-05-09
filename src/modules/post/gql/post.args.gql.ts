import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";



const ReactGQLEnumType  = new GraphQLEnumType({
    name :"ReactGQLEnumType" ,
    values:{
        "like" : {value : 1} ,
        "unlike" : {value : 0}

    }
})
export const PostList ={
    page :{type : GraphQLInt} ,
    size:{type : GraphQLInt},
    search :{type : GraphQLString} ,
    
}

export const reactOnPost ={
    postId :{type : new GraphQLNonNull(GraphQLID) } ,
    react:{type : new GraphQLNonNull(ReactGQLEnumType)} ,
    
}