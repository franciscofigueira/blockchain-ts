import {describe, expect, test} from "@jest/globals";
import{Block} from "../src/block.js";
import {Transaction} from "../src/transaction.js"
import {Wallet} from "../src/wallet.js";

describe("Block tests", () => {
    test("Block should initialize and pass verification", () => {
        const wallet1 =  Wallet.initialize()
        const wallet2 =  Wallet.initialize()
        const tx =  Transaction.initialize(wallet1.pubKey, wallet2.pubKey, 10, 0,[])
        tx.sign(wallet1)
        const block = Block.initialize(0,[tx], "prevHash")
        expect(block.height).toBe(0)
        expect(block.data).toStrictEqual([tx])
        expect(block.prevBlockHash).toBe("prevHash")
        expect(block.hash).toBe(block.calculateHash())
        block.verify()
    })
    test("Block that had any field altered should fail verification",() =>{
        const block = Block.initialize(0,[], "")
        block.height = 1
        expect(() => block.verify()).toThrowError()
    })
    test("Mined block should have hash first characters equal to difficulty",() =>{
        const block = Block.initialize(0,[], "prevHash")
        const difficulty = "ffff"
        block.mineBlock(difficulty)
        expect(block.hash.slice(0, difficulty.length)).toBe(difficulty)
    })
})
