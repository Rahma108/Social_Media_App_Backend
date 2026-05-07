
export interface ISignupResponse  extends ILoginResponse{
    username : string
}
export interface ILoginResponse {
    access_token: string;
    refresh_token: string 

}