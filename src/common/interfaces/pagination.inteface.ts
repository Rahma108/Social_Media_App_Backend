import { HydratedDocument } from "mongoose";

export interface IPagination <TRawDocument>{
    docs :HydratedDocument<TRawDocument>[] ,
    currentPage? :  number | string | undefined ,
    pages :  number | string ,
    size ?:  number | string | undefined

}