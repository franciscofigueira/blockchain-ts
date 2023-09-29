import { Block } from "./block.js";
import {VirtualMachine} from "./vm.js"

export type AccountDetails  = {
    balance: number
    nonce: number
}
export class Blockchain{
    blocks: Block[]
    accounts: Map<string, AccountDetails>
    blockDifficulty: string
    state: Map<number,number>
    constructor( blocks: Block[], accounts:
            Map<string, AccountDetails>,blockDifficulty: string, state: Map<number,number>){
        this.blocks = blocks
        this.accounts = accounts
        this.blockDifficulty = blockDifficulty
        this.state = state
    }
    
    static initialize(blockDifficulty: string, initialBalances?:Map<string, AccountDetails>){
        const genesisBlock = Block.initialize(0, [], "")
        if (initialBalances){
            return new Blockchain(  [genesisBlock],initialBalances, blockDifficulty,new Map<number,number>())
        }else{
            return new Blockchain( [genesisBlock],new Map<string, AccountDetails>(), blockDifficulty, new Map<number,number>())
        }
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
        if(block.hash.slice(0, this.blockDifficulty.length) !==
                this.blockDifficulty){
            throw new Error(`Invalid Proof of Work, block hash leading bytes
             must be ${this.blockDifficulty}, hash provided ${block.hash}`)
        }

        for(let i = 0; i< block.data.length; i++){
            const tx = block.data[i]
            const accountFrom = this.accounts.get(tx.from)
            const accountTo = this.accounts.get(tx.to)
            if(!accountFrom){
                throw new Error(`Account from: ${tx.from}
                 does not have any balance`)
            }else if (accountFrom.balance < tx.amount ){
                throw new Error(`Account from: ${tx.from}
                    does not enough balance, current balance:
                    ${accountFrom.balance}, transfer amount: ${tx.amount}`)
            }else if(accountFrom.nonce !== tx.nonce){
                throw new Error(`Invalid nonce, account current nonce:
                 ${accountFrom.nonce}, tx nonce: ${tx.nonce}`)
            }
            accountFrom.balance -= tx.amount
            accountFrom.nonce += 1
            this.accounts.set(tx.from, accountFrom)
            if(accountTo){
                accountTo.balance += tx.amount
                this.accounts.set(tx.to, accountTo)
            }else{
                this.accounts.set(tx.to,{nonce: 0, balance: tx.amount})
            }
            const vm = new VirtualMachine()
            vm.execute(tx.data,this.state)
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
            if(block.prevBlockHash !== prevBlockHash){
                throw new Error(`Block ${i} prevBlockHash should 
                be ${prevBlockHash}, found${block.prevBlockHash}`)
            }
            if(block.hash.slice(0, this.blockDifficulty.length) !==
            this.blockDifficulty){
                throw new Error(`Invalid Proof of Work, block hash leading bytes
                must be ${this.blockDifficulty}, hash provided ${block.hash}`)
            }
            block.verify()
        }
    }
}