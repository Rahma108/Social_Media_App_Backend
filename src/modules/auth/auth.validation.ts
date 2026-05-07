
import {z} from 'zod'
import { generalValidationFields } from '../../common/validation'

export const LoginSchema = {
    body : z.strictObject({
        email:generalValidationFields.email,
        password:generalValidationFields.password,
        FCM :z.string().optional()
    })
}
export const SignupSchema  = {
    body : LoginSchema.body.extend({
        username :generalValidationFields.username ,
        confirmPassword:generalValidationFields.confirmPassword,
        phone : generalValidationFields.phone
        
    }).superRefine((data , ctx)=>{
        if(data.password !== data.confirmPassword){
            ctx.addIssue({
                code:"custom" ,
                message: " Password Mismatch confirm password ❌",
                path:["confirmPassword"]
            })
        }
    })
}
export const confirmEmailSchema = {
    body:z.strictObject({
    email:generalValidationFields.email,
    otp:generalValidationFields.otp
})
}

export const resendConfirmEmailSchema = {
    body:z.strictObject({
    email:generalValidationFields.email
})
}
export const verifyEmailSchema = {
    body:z.strictObject({
    email:generalValidationFields.email
})
}

export const verifyForgotPasswordSchema = {
    body:z.strictObject({
    otp:generalValidationFields.otp
})
}
export const resetForgotPasswordSchema = {
    body: confirmEmailSchema.body.extend({
    password: generalValidationFields.password,
    confirmPassword: generalValidationFields.confirmPassword,
    }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
    }),
}

export const googleSignupSchema = {
    body: z.strictObject({
        idToken:generalValidationFields.idToken
    })
}


export const googleLoginSchema = {
    body: z.strictObject({
        idToken: generalValidationFields.idToken
    })
};
