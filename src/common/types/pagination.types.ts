import z from "zod";
import { paginationValidationSchema } from "../validation";
import { HydratedDocument } from "mongoose";

export type PaginationDTO = z.infer<typeof paginationValidationSchema.query>

export interface IPaginate<TRawDocument> {
    docs : HydratedDocument<TRawDocument>[] ,
        currentPage?: number | undefined ,
        pageSize?: number | undefined,
        pages?: number | undefined 
    
}