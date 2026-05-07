
import { Router } from "express"; 
import type { NextFunction, Request , Response , Router as RouterType } from "express";
import AuthService from "./auth.service";
import { successResponse } from "../../common/response";
import { IUser } from "../../common/interfaces";
import * as validators from './auth.validation'
import { validation } from "../../middleware";
import { ILoginResponse } from "./auth.interface";

const router: RouterType = Router()
router.post('/login', validation(validators.LoginSchema), async( req:Request , res:Response , next:NextFunction )=>{
    try {
        const result = await AuthService.login(req.body , `${req.protocol}://${req.host}`)
        return successResponse<ILoginResponse>({res , data : result })

    } catch (error) {
        throw  error
    }
})
router.patch('/confirm-email' ,  validation(validators.confirmEmailSchema) , async(req:Request , res:Response , next:NextFunction): Promise<Response>=>{
    try {
        await AuthService.confirmEmail(req.body)
        return successResponse({res})
    } catch (error) {
        throw error
    }
})

router.patch('/resend-confirm-email' ,  validation(validators.resendConfirmEmailSchema) , async(req:Request , res:Response , next:NextFunction ): Promise<Response>=>{
    try {
        await AuthService.reSendConfirmEmail(req.body)
        return successResponse({res})
    } catch (error) {
        throw error
    }
})
router.post('/signup' ,validation(validators.SignupSchema) , async(req:Request , res:Response  , next:NextFunction)=>{
    try {
        const result = await AuthService.signup(req.body)
        return successResponse<IUser>({res , status:201  , data: result})
    } catch (error) {
        throw error
    }
})

// Signup with Google
router.post('/signup/gmail', validation(validators.googleSignupSchema), async (req:Request , res:Response  , next:NextFunction) => {
    try {
        const issuer = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
        const { account, status } = await AuthService.signupWithGmail(
        req.body.idToken,
        issuer
);
    return successResponse({ res, status:status, data: { account } });
    } catch (err) {
        console.error("Signup Gmail Error:", err);
        return ;
    }
    });

// Login with Google
router.post('/login/gmail', validation(validators.googleLoginSchema), async (req:Request , res:Response  , next:NextFunction) => {
    try {
        const issuer = `${req.protocol}://${req.get('host') || 'localhost:3000'}`;
        const account = await AuthService.loginWithGmail(
        req.body.idToken,
        issuer
        );
        return successResponse({ res, data: { account } });
    } catch (err) {
        console.error("Login Gmail Error:", err) 
        return ;
    }
});


// Forget Password 
router.post('/request-forgot-password-code' ,  validation(validators.verifyEmailSchema) , async(req:Request , res:Response  , next:NextFunction)=>{
    await AuthService.requestForgotPasswordCode(req.body)
    return  successResponse({res , status:201})

})
router.patch('/verify-forgot-password-code' ,  validation(validators.confirmEmailSchema ) , async(req:Request , res:Response  , next:NextFunction )=>{
    await AuthService.verifyForgotPasswordCode(req.body)
    return  successResponse({res , status:200})

})

router.patch('/reset-forgot-password-code' ,  validation(validators.resetForgotPasswordSchema) , async(req:Request , res:Response  , next:NextFunction)=>{
    await AuthService.resetForgotPasswordCode(req.body)
    return  successResponse({res , status:200})
})


export default router
