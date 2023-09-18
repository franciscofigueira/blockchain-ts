import { randomBytes } from "crypto"
import pkg from 'secp256k1';
const { privateKeyVerify, publicKeyCreate, ecdsaSign } = pkg;

export class Wallet{
    pubKey: string
    private readonly privKey: Buffer

    constructor(privKey: Buffer){
        this.privKey = privKey
        this.pubKey =  Buffer.from(publicKeyCreate(privKey)).toString('hex')
    }

    static initialize(){
        let privKey: Buffer
        do {
            privKey = randomBytes(32)
        } while (!privateKeyVerify(privKey))
        return new Wallet(privKey)
    }

    sign(msg: Buffer){
        return ecdsaSign(msg, this.privKey)
    }
}