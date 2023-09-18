import { Block } from "./block.js";

export class Blockchain{
    blocks: Block[]

    constructor(blocks: Block[]){
        this.blocks = blocks
    }
    
    static initialize(genesisBlockData: string){
        const genesisBlock = Block.initialize(0, genesisBlockData, "")
        return new Blockchain([genesisBlock])
    }

    addBlock(block: Block){
        block.verify()
        const height = this.blocks.length
        const prevBlockHash = this.blocks[height - 1].hash
        if (block.height !== height){
            throw new Error(`Blockhain current height is ${height - 1},
             provided Block height is ${block.height}`)
        }
        if(block.prevBlockHash !== prevBlockHash){
            throw new Error(`Last block hash is ${prevBlockHash},
            provided Block height is ${block.height}`)
        }
        this.blocks.push(block)
    }

    validateChain(){
        for(let i = 1; i < this.blocks.length; i++){
            const block = this.blocks[i]
            const prevBlockHash = this.blocks[i-1].hash
            
            if(block.height !== i){
                throw new Error(`Block ${i} height should be ${i},
                 found ${block.height}`)
            }
            if(block.prevBlockHash != prevBlockHash){
                throw new Error(`Block ${i} prevBlockHash should 
                be ${prevBlockHash}, found${block.prevBlockHash}`)
            }
            block.verify()
        }
    }
}