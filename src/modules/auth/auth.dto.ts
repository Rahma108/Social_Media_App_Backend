
import { confirmEmailSchema, LoginSchema, resendConfirmEmailSchema, resetForgotPasswordSchema, SignupSchema, verifyEmailSchema } from "./auth.validation"
import {z} from "zod"
export type LoginDTO = z.infer<typeof LoginSchema.body>
export type SignupDTO = z.infer<typeof SignupSchema.body>
export type ConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>
export type ResendConfirmEmailDTO = z.infer<typeof resendConfirmEmailSchema.body>
export type VerifyEmailOtpDTO = z.infer<typeof verifyEmailSchema.body>
export type ResetForgotPasswordOtpDTO = z.infer<typeof resetForgotPasswordSchema.body>