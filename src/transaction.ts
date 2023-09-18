import { sha256 } from "js-sha256"
import { Wallet } from "./wallet.js"
import pkg from 'secp256k1';
const { ecdsaVerify } = pkg;


export class Transaction{
    from: string
    to: string
    amount: number
    nonce: number
    hash: string
    signature: string

    constructor(from: string, to:string, amount:number, nonce: number,hash:string, signature: string){
        this.from = from
        this.to = to
        this.amount = amount
        this.nonce = nonce
        this.hash = this.calculateHash()
        this.signature = signature
    }

    static initialize(from: string, to:string, amount:number, nonce: number){
        const newTx = new Transaction(from, to, amount, nonce, "" ,"")
        newTx.hash = newTx.calculateHash()
        return newTx
    }

    calculateHash(){
        return sha256(this.from + 
            this.to + this.amount + this.nonce )
    }

    sign(signer: Wallet){
        if(signer.pubKey !== this.from){
            throw new Error(`Tx from: ${this.from} does not match signer: 
            ${signer.pubKey}`)
        }
        const sigObj  = signer.sign(Buffer.from(this.hash,'hex'))
        this.signature = Buffer.from(sigObj.signature).toString('hex')
    }

    verify(){
        const hash = this.calculateHash()
        if(hash !== this.hash){
            throw new Error(`hash does not match, expected:${this.hash},
             found:${hash}`)
        } 
        if(!ecdsaVerify(Buffer.from(this.signature,'hex'),
                        Buffer.from(hash,'hex'), Buffer.from(this.from,'hex'))){
            throw new Error("Signature verification failed")
        }
    }
}
