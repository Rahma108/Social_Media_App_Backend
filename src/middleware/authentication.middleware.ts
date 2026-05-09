
import type { NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common/exception"
import { TokenTypeEnum } from "../common/enums/security.enum"
import { RoleEnum } from "../common/enums"
import { ForbiddenException } from "../common/exception"
import { TokenService } from "../common/service/token.service"
import { HydratedDocument } from "mongoose"
import { IUser } from "../common/interfaces"
import { GQLError } from "../common/exception/GQLError.exception"


export const authentication = (
  tokenType = TokenTypeEnum.access
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tokenService : TokenService = new TokenService()
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException("Missing authorization key");
    }

    const [flag, credentials] = authHeader.split(" ");

    if (!flag || !credentials) {
      throw new BadRequestException("Invalid authorization format");
    }

    switch (flag) {
      case "Bearer": {
        const { user, decoded } = await tokenService.decodeToken({
          token: credentials,
          tokenType,
        });

        req.user = user ;
        req.decoded = decoded
        break;
      }

      default:
        throw new BadRequestException("Unsupported authorization type");
    }

    next();
  };
};

export const authorization =  ( accessRoles : RoleEnum[]  )=>{
    return async  (req:Request, res: Response, next: NextFunction )=>{
      const user = (req as any).user;
            if(!accessRoles.includes(user.role)){
                throw new ForbiddenException("Not allowed account !")
            }
            
            next()
    }
    

  }
export const isAuthorized = async (accessRoles : RoleEnum[] , user:HydratedDocument<IUser>): Promise<Boolean>=>{
  //  من عندى 
        if(!accessRoles.includes(user.role as RoleEnum )){
                throw GQLError(new ForbiddenException("Not allowed account !"))
        }else{
              return true 
        }

}