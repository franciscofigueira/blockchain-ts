import { Blockchain } from "./blockchain.js";
import { Block } from "./block.js";
import { Wallet } from "./wallet.js";
import { Transaction } from "./transaction.js";
import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { floodsub } from '@libp2p/floodsub'
import { mdns } from '@libp2p/mdns'
import { tcp } from '@libp2p/tcp'
import { identifyService } from 'libp2p/identify'
import 'dotenv/config'
import {Instruction} from "./vm.js"
const createNode = async () => {
    const node = await createLibp2p({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
        },
        transports: [tcp()],
        streamMuxers: [yamux()],
        connectionEncryption: [noise()],
        peerDiscovery: [
            mdns({
                interval: 20e3
            })
        ],
        services: {
            pubsub: floodsub(),
            identify: identifyService()
        }
    })
    return node
}

const TOPICS = {
    block: "BLOCK",
    chain: "CHAIN"
}

export class Server{
    blockchain: Blockchain
    wallets: Wallet[]

    private constructor(blockchain: Blockchain, wallets: Wallet[]){
        this.blockchain = blockchain
        this.wallets = wallets
    }

    static initialize(blockchain: Blockchain, wallets: Wallet[]){
        return new Server(blockchain, wallets)
    }

    async start(){
        const node = await createNode()
      
        node.addEventListener('peer:discovery', (evt) => console.log("\x1b[34m%s\x1b[0m",'Discovered:', evt.detail.id.toString()))
        
        node.services.pubsub.subscribe(TOPICS.block)
        node.services.pubsub.subscribe(TOPICS.chain)
        
        node.services.pubsub.addEventListener("message", (evt) => {
            console.log(`node received: ${Buffer.from(evt.detail.data).toString()} on topic ${evt.detail.topic}`)
            if(evt.detail.topic === TOPICS.block){
                const block: Block = parseBlock(Buffer.from(evt.detail.data).toString())
                try {
                    this.blockchain.addBlock(block)
                    console.log("\x1b[34m%s\x1b[0m","Block from P2P network added")
                } catch (error) {
                    console.log("\x1b[31m%s\x1b[0m","Failed to add block", error)
                }
            }
            if(evt.detail.topic === TOPICS.chain){
                try {
                    const chain = JSON.parse(Buffer.from(evt.detail.data).toString(),reviver)
                    let blocks: Block[] = []
                    for(let i = 0; i < chain.blocks.length; i++){
                        blocks.push(parseBlock(JSON.stringify(chain.blocks[i])))
                    }
                    const blockchain = new Blockchain(blocks, chain.accounts, chain.blockDifficulty, chain.state)
                    blockchain.validateChain()
                    if(blockchain.blocks.length > this.blockchain.blocks.length){
                        this.blockchain = blockchain
                        console.log("\x1b[32m%s\x1b[0m","Blockchain from P2P network replaced local blockchain")
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        })
  
        process.stdin.on('data', async data => {
            let stringData = data.toString()
            if(stringData.slice(0,1) === 'b'){
                console.log('\x1b[36m%s\x1b[0m',"Adding block to chain and transmitting on P2P network");
                let array = stringData.split(" ")
                console.log('\x1b[36m%s\x1b[0m','Sent Block on P2P network',
                            await node.services.pubsub.publish(TOPICS.block, this.addAndTransmitBlock(array)))
            }  else if(stringData.slice(0,1) === 'c'){
                console.log('\x1b[32m%s\x1b[0m',"Transmitting chain over p2p network")
                console.log('\x1b[32m%s\x1b[0m',"Sent Local Blockchain on P2P network",
                            await node.services.pubsub.publish(TOPICS.chain, Buffer.from(JSON.stringify(this.blockchain,replacer))))
            } else if(stringData.slice(0,1) === 'p'){
                console.log('\x1b[33m%s\x1b[0m',"Printing Local Blockchain \n",this.blockchain)
            } else if(stringData.slice(0,1) === 'v'){
                console.log('\x1b[35m%s\x1b[0m',"Adding block with transaction with VM instructions to chain and transmitting on P2P network\n")
                console.log('\x1b[35m%s\x1b[0m',"Sent Block on P2P network \n",
                await node.services.pubsub.publish(TOPICS.block, this.addAndTransmitBlockWithCode()))
            } else{
                console.log(`Invalid command you've typed ${data.toString()}`);
            }
        });
    }
    addAndTransmitBlock(data: string[]){
        let tx: Transaction | undefined = undefined
        if(data[1] && data[2] && data[3]&& data[4]){
            try {
                tx = Transaction.initialize(this.wallets[Number(data[1])].pubKey, this.wallets[data[2]].pubKey, Number(data[3]), Number(data[4]),[])
                tx.sign(this.wallets[Number(data[1])])
            } catch (error) {
                console.log(error)
            }
        }
        let block: Block
        const height = this.blockchain.blocks.length
        const prevHash = this.blockchain.blocks[height-1].hash
        if(tx){
            block = Block.initialize(height,[tx],prevHash)
        }else{
            block = Block.initialize(height,[],prevHash)
        }
        block.mineBlock(this.blockchain.blockDifficulty)
        try {
            this.blockchain.addBlock(block)
            return Buffer.from(JSON.stringify(block))
        } catch (error) {
            console.log(error)
        }
    }

    addAndTransmitBlockWithCode(){
        const instructions:Instruction[] = JSON.parse(process.env.CODE)
        const tx = Transaction.initialize(this.wallets[0].pubKey, "", 0, 0,instructions)
        tx.sign(this.wallets[0])
        const height = this.blockchain.blocks.length
        const prevHash = this.blockchain.blocks[height-1].hash
        const block = Block.initialize(height,[tx],prevHash)
        block.mineBlock(this.blockchain.blockDifficulty)
        try {
            this.blockchain.addBlock(block)
            return Buffer.from(JSON.stringify(block))
        } catch (error) {
            console.log(error)
        }
    }
}

export function parseBlock(msg: string): Block{
    try {
        const parsedObject =  JSON.parse(msg)
        const block: Block = new Block(parsedObject.height,parsedObject.data,parsedObject.prevBlockHash, parsedObject.nonce, parsedObject.hash)
        for (let i = 0; i< block.data.length; i++){
            let tx = block.data[i]
            block.data[i] =  new Transaction(tx.from, tx.to, tx.amount, tx.nonce, tx.data ,tx.hash, tx.signature)
        }
        block.verify()
        console.log("block received",block)
        return block
    } catch (error) {
        throw new Error(error)
    }
}

export  function replacer(key: any ,value: any) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), 
        };
    } else {
        return value;
    }
}

export  function reviver(key: any, value: any) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
      return value;
}