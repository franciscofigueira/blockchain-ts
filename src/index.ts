import { Block } from "./block.js";
import { Blockchain } from "./blockchain.js";

function main(){
    const blockchain = Blockchain.initialize("Hello world")
    const block1 = Block.initialize(1, "First Block", blockchain.blocks[0].hash)
    blockchain.addBlock(block1)
    const block2 = Block.initialize(2, "Second Block", blockchain.blocks[1].hash)
    blockchain.addBlock(block2)

    blockchain.validateChain()
    console.log("Blockchain is valid")

    blockchain.blocks[1].data = "Tampered data"
    blockchain.blocks[1].hash = blockchain.blocks[1].calculateHash()

    try {
        blockchain.validateChain()
        console.log("Blockchain is valid")
    } catch (error) {
        if(error instanceof Error){
            console.error("Blockchain is Invalid, cause:",error.message)
        }
    }
    console.log("Finished")
}

main()