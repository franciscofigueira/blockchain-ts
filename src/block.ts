import {sha256} from "js-sha256"
import { Transaction } from "./transaction.js"
export class Block{
    height: number
    data: Transaction[]
    prevBlockHash: string
    hash: string

    constructor(height: number, data: Transaction[], prevBlockHash: string, hash: string){
        this.height = height
        this.data = data
        this.prevBlockHash = prevBlockHash
        this.hash = hash
    }
    
    static initialize(height: number, data: Transaction[], prevBlockHash: string){
        const newBlock = new Block(height,data, prevBlockHash, "")
        newBlock.hash = newBlock.calculateHash()
        return newBlock
    }

    calculateHash(){
        return sha256(this.height + this.data.toString() + this.prevBlockHash)
    }

    verify(){
        for(let i= 0; i < this.data.length; i++){
            this.data[i].verify()
        }
        const hash = this.calculateHash()
        if(hash !== this.hash){
            throw new Error(`Block ${this.height} hash should be ${hash},
             found ${this.hash}`)
        }
    }
}
