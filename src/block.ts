import {sha256} from "js-sha256"
export class Block{
    height: number
    data: string
    prevBlockHash: string
    hash: string

    constructor(height: number, data: string, prevBlockHash: string, hash: string){
        this.height = height
        this.data = data
        this.prevBlockHash = prevBlockHash
        this.hash = hash
    }
    
    static initialize(height: number, data: string, prevBlockHash: string){
        const newBlock = new Block(height,data, prevBlockHash, "")
        newBlock.hash = newBlock.calculateHash()
        return newBlock
    }

    calculateHash(){
        return sha256(this.height + this.data + this.prevBlockHash)
    }

    verify(){
        const hash = this.calculateHash()
        if(hash !== this.hash){
            throw new Error(`Block ${this.height} hash should be ${hash},
             found ${this.hash}`)
        }
    }
}
