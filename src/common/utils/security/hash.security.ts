import * as argon2 from 'argon2'
import { compare, hash } from 'bcrypt'
import { HashEnum } from '../../enums/security.enum.js'
import { SALT_ROUND } from '../../../config/config.js'
export const generateHash = async ({
    plaintext,
    salt = SALT_ROUND,
    algorithm= HashEnum.Bcrypt
}:{
    plaintext: string,
    salt?: number,
    algorithm?:number

}
    ): Promise<string> => {
    let hashResult = '';

    switch (algorithm) {
        case HashEnum.Argon2:
        hashResult = await argon2.hash(plaintext);
        break;

        default:
        hashResult = await hash(plaintext, salt);
        break;
    }

    return hashResult;
};

export const compareHash = async ({
    plaintext,
    cipherText,
    algorithm= HashEnum.Bcrypt
}:{
    plaintext: string,
    cipherText: string,
    algorithm?: HashEnum 
}
    ): Promise<boolean> => {
    let match = false;

    switch (algorithm) {
        case HashEnum.Bcrypt:
        match = await compare(plaintext , cipherText);
        break;

        case HashEnum.Argon2:
        match = await argon2.verify(cipherText, plaintext );
        break;

        default:
        match = await compare(plaintext , cipherText);
        break;
    }

    return match;
};



