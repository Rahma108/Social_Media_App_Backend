import { config } from 'dotenv'
import { resolve } from 'path'

config({
   path: resolve(`./.env.${process.env['NODE_ENV'] || 'development'}`)
})


export const PORT = process.env['PORT']  as string
export const DB_URI = process.env['DB_URI'] as string
export const REDIS_URI= process.env['REDIS_URI'] as string

export const SALT_ROUND = Number(process.env['SALT_ROUND']) || 10;
export const IV_LENGTH = Number(process.env['IV_LENGTH']) || 16;

if (!process.env['SECURITY_KEY']) {
  throw new Error("SECURITY_KEY is not defined in environment variables");
}

export const SECURITY_KEY = process.env['SECURITY_KEY'] as string;



export const System_TOKEN_SECURITY_KEY = process.env['System_TOKEN_SECURITY_KEY'] as string
export const User_TOKEN_SECURITY_KEY= process.env['User_TOKEN_SECURITY_KEY'] as string

export const System_REFRESH_TOKEN_SECURITY_KEY = process.env['System_REFRESH_TOKEN_SECURITY_KEY']  as string
export const User_REFRESH_TOKEN_SECURITY_KEY= process.env['User_REFRESH_TOKEN_SECURITY_KEY']  as string

export const ACCESS_EXPIRES_IN= parseInt(process.env['ACCESS_EXPIRES_IN'] as string )  
export const REFRESH_EXPIRES_IN= parseInt(process.env['REFRESH_EXPIRES_IN'] as string)



// OTP
export const GMAIL=process.env['GMAIL'] as string
export const PASSWORD=process.env['PASSWORD'] as string
export const APPLICATION_NAME=process.env['APPLICATION_NAME'] as string

export const LINKEDIN_LINK=process.env['LINKEDIN_LINK'] as string
export const GITHUB=process.env['GITHUB'] as string
export const INSTAGRAM_LINK=process.env['INSTAGRAM_LINK'] as string

export const CLIENT_ID = process.env['CLIENT_ID'] as string



export const AWS_REGIONS = process.env['AWS_REGIONS'] as string
export const AWS_BUCKET_NAME= process.env['AWS_BUCKET_NAME'] as string
export const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'] as string
export const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'] as string
export const AWS_EXPIRES_IN = parseInt(process.env['AWS_EXPIRES_IN'] as string || "120")