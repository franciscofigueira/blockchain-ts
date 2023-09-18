import {describe, expect, test} from '@jest/globals';
import {Transaction} from "../src/transaction.js"
import {Wallet} from "../src/wallet.js";

describe("Transaction tests", () => {
    test("Transaction should correclt initialize and valid signature should be validated", ()=>{
        const wallet1 =  Wallet.initialize()
        const wallet2 =  Wallet.initialize()
        const tx =  Transaction.initialize(wallet1.pubKey, wallet2.pubKey, 10, 0)
        expect(tx.from).toBe(wallet1.pubKey)
        expect(tx.to).toBe(wallet2.pubKey)
        expect(tx.amount).toBe(10)
        expect(tx.nonce).toBe(0)
        expect(tx.hash).toBe(tx.calculateHash())
        tx.sign(wallet1)
        tx.verify()
    })
    test('Wallet with pubKey not equal to From should not be able to sign', ()=>{
        const wallet1 =  Wallet.initialize()
        const wallet2 =  Wallet.initialize()
        const tx =  Transaction.initialize(wallet1.pubKey, wallet2.pubKey, 10, 0)
        expect(() =>tx.sign(wallet2)).toThrowError()
    })
    test('Tamapered transaction should not validate', ()=>{
        const wallet1 =  Wallet.initialize()
        const wallet2 =  Wallet.initialize()
        const wallet3 =  Wallet.initialize()
        const tx =  Transaction.initialize(wallet1.pubKey, wallet2.pubKey, 10, 0)
        tx.sign(wallet1)
        tx.to = wallet3.pubKey
        expect(() => tx.verify()).toThrow(Error)
    })
})