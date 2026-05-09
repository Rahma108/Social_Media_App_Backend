import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql";
import { AvailabilityEnum } from "../../../common/enums";


export const AvailabilityGQLEnumType = new GraphQLEnumType({
    name : "AvailabilityGQLEnumType" ,
    values :{
        public :{ value :AvailabilityEnum.PUBLIC } ,
        friend: { value :AvailabilityEnum.FRIENDS }  ,
        only_me: { value :AvailabilityEnum.ONLY_ME }  
    }
})
export const  OnePostType = new GraphQLObjectType({
    name :"OnePostType" ,
    fields:{
        _id : {type : new GraphQLNonNull(GraphQLID)} ,
        folderId:{type : new GraphQLNonNull(GraphQLString)} ,
        content:{type : new GraphQLNonNull(GraphQLString)} ,
            attachments: {type : new GraphQLList(GraphQLString)} ,
            likes :{type : new GraphQLList(OneUserType)} ,
            tags :{type : new GraphQLList(OneUserType)} ,
            availability:{type : AvailabilityGQLEnumType},
        
            createdBy :{type : new GraphQLNonNull(OneUserType)} ,
            updatedBy: {type : OneUserType} ,
            createdAt :{type : GraphQLString},
            updatedAt : {type : GraphQLString},
            deletedAt : {type : GraphQLString},
            restoredAt : {type : GraphQLString},

    }
})
export const postList = new GraphQLObjectType({
    name : "postListResponse" ,
    fields :{
        message : {type : new GraphQLNonNull(GraphQLString) } ,
        data:{
            type :  new GraphQLObjectType({
            name : "PostPaginationResponse" ,
            fields :{
                docs :{type : new GraphQLList(OnePostType)},
                    currentPage :  {type : GraphQLInt},
                    pages :  {type : GraphQLInt} ,
                    size : {type : GraphQLInt}
            }

        })
        }

    }
})

export const reactOnPost = new GraphQLObjectType({
    name : "reactOnPostResponse" ,
    description : "react On Post" ,
    fields :{
        message : {type : GraphQLString  } ,
        data:{
            type : OnePostType

        }
    }})