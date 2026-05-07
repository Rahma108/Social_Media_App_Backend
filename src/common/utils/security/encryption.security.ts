import crypto from 'crypto';
import { IV_LENGTH, SECURITY_KEY } from '../../../config/config';


const algorithm = 'aes-256-cbc';


const key = Buffer.from(SECURITY_KEY); 

export const encrypt = async(text: string):Promise<string>  => {

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = async(data: string): Promise<string> => {
    const parts = data.split(":");

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        throw new Error("Invalid encrypted data format ❌");
    }

    const ivHex: string = parts[0];
    const encryptedText: string = parts[1];

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted: string = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};