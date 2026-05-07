
import { EmailEnum, ProviderEnum } from "../../common/enums";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exception";
import { IUser } from "../../common/interfaces";
import { emailEmitter, emailTemplate, sendEmail } from "../../common/utils/email";
import { createNumberOtp } from "../../common/utils/otp";
import { compareHash, generateHash } from "../../common/utils/security";
import { UserRepository } from "../../DB/repository/user.repository";
import { ConfirmEmailDTO, LoginDTO, ResendConfirmEmailDTO, SignupDTO, VerifyEmailOtpDTO } from "./auth.dto"
import {   redisService, } from "../../common/service";
import { TokenService } from "../../common/service/token.service";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { CLIENT_ID } from "../../config/config";

export class AuthService {
    // To reach any Repository ..
    private readonly userRepository : UserRepository
    private readonly redisService  = redisService
    private readonly tokenService : TokenService
    constructor(){
        this.userRepository= new UserRepository()
        this.tokenService = new TokenService()
    }
    
    private verifyEmailOtp = async({ title   , subject=EmailEnum.confirmEmail ,  email }
        :{title:string , subject:EmailEnum , email:string } )=>{
           //Check Block Conditional .
        const blockKey=  this.redisService.otpBlockKey({email , type:subject })
        const remainingBlockTime = await this.redisService.ttl(blockKey)
        if(remainingBlockTime>0){
            throw  new ConflictException(`You have reached Max Request Trial Count please try again later after ${remainingBlockTime} sec. `)
        }

        const oldCodeTTL = await this.redisService.ttl(this.redisService.otpKey({email , type:subject}))
        if(oldCodeTTL > 0 ){
            throw  new ConflictException(`Sorry we can not send new otp until first one get expired please try again after ${oldCodeTTL} `)

        }
        //check Max Request Trials 
        const maxTrialKey = this.redisService.otpMaxRequestKey({email , type:subject })
            const checkOtpMaxRequest = Number(await this.redisService.get(maxTrialKey) || 0 )
            if(checkOtpMaxRequest>=3){
                await this.redisService.set({
                key:  blockKey , 
                value : 0
                , ttl:300 })
        
            throw  new ConflictException("You have reached Max Request Trial Count please try again later after 300 sec. ")

            }

            const code = await createNumberOtp()
            await this.redisService.set({
            key: this.redisService.otpKey({email , type:subject }) , 
            value : await generateHash({plaintext : code.toString()})
            , ttl: 120
        })
            await sendEmail({
                to:email ,
                subject,
                html:emailTemplate({code , title })
            })
        checkOtpMaxRequest  > 0 ? await this.redisService.increment(maxTrialKey): await this.redisService.set({key : maxTrialKey , value : 1 , ttl : 300 })
        return ;
}

//Confirm Email with otp..
    public  confirmEmail = async({otp , email} : ConfirmEmailDTO ) : Promise<void>=>{

        const account = await this.userRepository.findOne({
        filter:{email , confirmEmail: { $eq: null } , Provider:ProviderEnum.SYSTEM }  ,
        projection:"email"
    })
    if(!account){
        throw  new NotFoundException("Fail to find Match account ❌")
    }
    const hashOtp = await this.redisService.get(this.redisService.otpKey({email}))
    if(!hashOtp){
        throw new NotFoundException("Expired OTP 😊")
    }
    if(!await compareHash({plaintext: otp  , cipherText: hashOtp} )){
        throw  new ConflictException("Invalid OTP ❌")
    }
    account.confirmEmail = new Date()
    await account.save()
    await this.redisService.deleteKeys(await this.redisService.keys(this.redisService.otpKey({email })))
    return ;
    }

    public reSendConfirmEmail = async({email}: ResendConfirmEmailDTO)=>{
        const account = await this.userRepository.findOne({
        filter:{email , confirmEmail: { $eq: null } , Provider:ProviderEnum.SYSTEM }  ,
        projection:"email"
    })
    if(!account){
        throw new  NotFoundException("Fail to find Match account ❌")
    }
        // Re-Send a verification code to email after registration
    await this.verifyEmailOtp({title  : "Verify Account", subject: EmailEnum.confirmEmail , email:email })
    return ;


}
    public  async login(inputs:LoginDTO , issuer: string): Promise<{ access_token: string; refresh_token: string }>{
        const  { email , password  } = inputs
        const user = await this.userRepository.findOne({
            filter:{email, confirmEmail:{$ne : null} , provider:ProviderEnum.SYSTEM  },
            options:{lean:false}
        })
        if(!user){
            throw new NotFoundException("Invalid Login Credentials ❌")
        }
        if(!await compareHash({plaintext:password , cipherText: user.password })){
            throw new NotFoundException("Invalid Login Credentials ❌")
        }

        // store fcm in redis .
        return this.tokenService.createLoginCredentials(user , issuer)
    }

    public async  signup (data:SignupDTO):Promise<IUser> {
        let {username , email , password , phone} = data
        const checkUserExist = await this.userRepository.findOne({filter:{email } , projection:"email" , options:{lean:true}}) 
        if(checkUserExist){
                throw new ConflictException("Email Exists ‼️‼️")
        }
        const user =  await this.userRepository.create({data: {username , email , password: password , phone:phone } })
        // const user = await this.userRepository.createOne({data: {username , email , password } })
        if(!user){
            throw new BadRequestException("Fail To Create User ✖️")
        }
        
        emailEmitter.emit("sendEmail" ,async ()=>{
        await this.verifyEmailOtp({title  : "Verify Account", subject: EmailEnum.confirmEmail , email:email })
    })
        return user.toJSON()
    }

    // With Google 
    
    private async  verifyGoogleAccount(idToken : string ) : Promise<TokenPayload>{
            const client = new OAuth2Client();
            const ticket = await client.verifyIdToken({
                idToken,
                audience: CLIENT_ID , 
            });
            const payload = ticket.getPayload();
            console.log(payload);
            if(!payload?.email_verified){
            throw new  BadRequestException("Fail to verify authenticated this account with google 🫠")

            }
            return payload


}

    async loginWithGmail (idToken: string , issuer : string){
    if (!idToken) {
        throw new BadRequestException( "idToken is required" );
    }
    const payload = await this.verifyGoogleAccount(idToken)
    const user = await this.userRepository.findOne( {filter:{ email:payload.email as string , provider:ProviderEnum.GOOGLE } } )
    if(!user){
        throw  new NotFoundException( "Invalid Login Credentials .")

    }

    return await this.tokenService.createLoginCredentials(user, issuer) 
}

    async signupWithGmail(idToken: string , issuer : string){
        if (!idToken) {
            throw new BadRequestException("idToken is required" );
        }
        const payload = await this.verifyGoogleAccount(idToken)
        const checkUserExist = await this.userRepository.findOne( {filter:{ email:payload.email as string }} )
        if(checkUserExist){
            // 1- User Exists in Database  And Provider == System  ==> Throw Error ..
            if(checkUserExist.provider == ProviderEnum.SYSTEM){
            throw new ConflictException("Account Already Exist With Different Provider ‼️")

        }
            const token = await this.tokenService.createLoginCredentials(checkUserExist, issuer);
            return { account: token, status: 200 };

        }

        //  3- User Not Exists ==> Create with Provider Google .
        // New user → create + login
        const newUser = await this.userRepository.create({
            data: {
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            email: payload.email,
            provider: ProviderEnum.GOOGLE,
            profileImage: payload.picture,
            confirmEmail: new Date(),
            phone:""
            }
        });

        const token = await this.tokenService.createLoginCredentials(newUser, issuer);
        return { account: token , status: 201 };


}
        // Forgot Password.
        
    async  requestForgotPasswordCode({email}:VerifyEmailOtpDTO){
            const account = await this.userRepository.findOne({
            projection :"email" ,
            filter:{email , confirmEmail:{ $ne: null } , Provider:ProviderEnum.SYSTEM} 
        })
        if(!account){
            throw new  NotFoundException("Fail to find Match account ❌")
        }
        emailEmitter.emit("sendEmail" ,async ()=>{
                await this.verifyEmailOtp({title : "Forgot Password" , subject:EmailEnum.ForgotPassword , email })
            })
    return ;
}
async verifyForgotPasswordCode ({email , otp }:ConfirmEmailDTO ):Promise<void>{
    const hashOtp = await redisService.get(redisService.otpKey({email , type:EmailEnum.ForgotPassword }))
    if(!hashOtp){
        throw  new NotFoundException("Expired OTP ❌")
    }
    if(!await compareHash({plaintext: otp , cipherText:hashOtp} )){
        throw new ConflictException("Invalid OTP 😊")
    }
    return ;
}

    async  resetForgotPasswordCode({email , otp , password}:{email : string , otp : string , password: string } ){
    await this.verifyForgotPasswordCode({email ,otp })
    const account = await this.userRepository.findOneAndUpdate({
        filter :{email , confirmEmail:{ $ne: null } , Provider:ProviderEnum.SYSTEM } ,
        update:{
            password:await generateHash({plaintext :password}),
            changeCredentialTime:new Date() // All Logout
        }

    })
    if(!account){
        throw  new NotFoundException("Fail to find Match account ❌")
    }
    Promise.allSettled([
            await redisService.deleteKeys(await redisService.keys((redisService.otpKey({email , type:EmailEnum.ForgotPassword })))),
            await redisService.deleteKeys(await redisService.keys(redisService.baseRevokeTokenKey(account._id.toString())))
    ])
    return ;
}



}


export default new AuthService()

