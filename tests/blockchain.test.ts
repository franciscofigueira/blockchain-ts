import {describe, expect, test} from '@jest/globals';
import {Blockchain, AccountDetails} from "../src/blockchain.js";
import {Block} from "../src/block.js";
import {Transaction} from "../src/transaction.js"
import {Wallet} from "../src/wallet.js";

describe("Blockchain tests", () => {
    test('Blockchain should correctly initalize', () => {
        const blockchain = Blockchain.initialize()
        expect(blockchain.blocks.length).toBe(1)
        expect(blockchain.blocks[0].height).toBe(0)
        blockchain.validateChain()
    })
    test('Blochain should add valid block, with valid transaction',() =>{
        const wallet1 =  Wallet.initialize()
        const wallet2 =  Wallet.initialize()
        const wallet3 = Wallet.initialize()
        const balances = new Map<string,AccountDetails>()
        balances.set(wallet1.pubKey, {balance: 100, nonce: 0})
        const blockchain = Blockchain.initialize(balances)
        const tx =  Transaction.initialize(wallet1.pubKey, wallet2.pubKey, 10, 0)
        tx.sign(wallet1)
        const tx2 =  Transaction.initialize(wallet2.pubKey, wallet3.pubKey, 5, 0)
        tx2.sign(wallet2)
        const block = Block.initialize(1,[tx,tx2],blockchain.blocks[0].hash)
        blockchain.addBlock(block)
        expect(blockchain.accounts.get(wallet1.pubKey)).toStrictEqual({balance:90, nonce: 1})
        expect(blockchain.accounts.get(wallet2.pubKey)).toStrictEqual({balance:5, nonce: 1})
        expect(blockchain.accounts.get(wallet3.pubKey)).toStrictEqual({balance:5, nonce: 0})
        blockchain.validateChain()
    })
    test('Blockchain should not add block with incorrect height or prevBlockHash',() =>{
        const blockchain = Blockchain.initialize()
        const blockWrongHeight = Block.initialize(2,[],blockchain.blocks[0].hash)
        const blockWrongPrevBlockHash = Block.initialize(1,[],"test")
        expect(() => blockchain.addBlock(blockWrongHeight)).toThrowError()
        expect(() => blockchain.addBlock(blockWrongPrevBlockHash)).toThrowError()
    })
    test('Blochain should not add block with transaction with insufficient balance or incorrect nonce',() =>{
        const wallet1 =  Wallet.initialize()
        const wallet2 =  Wallet.initialize()
        const balances = new Map<string,AccountDetails>()
        balances.set(wallet1.pubKey, {balance: 100, nonce: 0})
        const blockchain = Blockchain.initialize(balances)
        const txInvalidBalance =  Transaction.initialize(wallet2.pubKey, wallet1.pubKey, 10, 0)
        txInvalidBalance.sign(wallet2)
        const blockInvalidBalance = Block.initialize(1,[txInvalidBalance],blockchain.blocks[0].hash)
        const txInvalidNonce =  Transaction.initialize(wallet1.pubKey, wallet2.pubKey, 10, 1)
        txInvalidNonce.sign(wallet1)
        const blockInvalidNonce = Block.initialize(1,[txInvalidNonce],blockchain.blocks[0].hash)
        expect(() => blockchain.addBlock(blockInvalidBalance)).toThrowError()
        expect(() => blockchain.addBlock(blockInvalidNonce)).toThrowError()
    })
})
