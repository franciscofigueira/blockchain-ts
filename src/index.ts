import { Blockchain, AccountDetails } from "./blockchain.js";
import { Wallet } from "./wallet.js";
import { Server } from "./server.js";
import 'dotenv/config'

async function main(){
    const wallet1 = new Wallet(Buffer.from(process.env.PRIVATE_KEY_1,'hex'))
    const wallet2 = new Wallet(Buffer.from(process.env.PRIVATE_KEY_2,'hex'))
    const map = new Map<string,AccountDetails>()
    map.set(wallet1.pubKey,{nonce:0, balance: 100})
    map.set(wallet2.pubKey,{nonce:0, balance: 100})
    const blockDifficulty = '0000'
    const blockchain =  Blockchain.initialize(blockDifficulty,map)
    const server = Server.initialize(blockchain,[wallet1,wallet2])
    server.start()
}
main()
