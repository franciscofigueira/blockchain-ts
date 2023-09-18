import { Block } from "./block.js";
import { Blockchain, AccountDetails } from "./blockchain.js";
import { Transaction } from "./transaction.js";
import { Wallet } from "./wallet.js";

function main(){
    const wallet1 = Wallet.initialize()
    const wallet2 = Wallet.initialize()
    const balances = new Map<string, AccountDetails>()
    balances.set(wallet1.pubKey, {balance:100,nonce:0})
    balances.set(wallet2.pubKey, {balance:100,nonce:0})

    const blockchain = Blockchain.initialize(balances)
    console.log(blockchain.accounts.get(wallet1.pubKey))
    console.log(blockchain.accounts.get(wallet2.pubKey))

    const block1 = Block.initialize(1, [], blockchain.blocks[0].hash)
    blockchain.addBlock(block1)

    const tx = Transaction.initialize(wallet1.pubKey,wallet2.pubKey, 20, 0)
    tx.sign(wallet1)
    const block2 = Block.initialize(2, [tx], blockchain.blocks[1].hash)
    blockchain.addBlock(block2)

    blockchain.validateChain()
    console.log("Blockchain is valid")

    console.log(blockchain.accounts.get(wallet1.pubKey))
    console.log(blockchain.accounts.get(wallet2.pubKey))

    const block3 = Block.initialize(3,[tx],blockchain.blocks[2].hash)
    try {
        blockchain.addBlock(block3)
    } catch (error) {
        if(error instanceof Error){
            console.error("Cannot add block, cause:",error.message)
        }
    }
}
main()