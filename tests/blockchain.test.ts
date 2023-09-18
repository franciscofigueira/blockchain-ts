import {describe, expect, test} from '@jest/globals';
import {Blockchain} from "../src/blockchain.js";
import {Block} from "../src/block.js";

describe("Blockchain tests", () => {
    test('Blockchain should correctly initalize', () => {
        const blockchain = Blockchain.initialize("Test")
        expect(blockchain.blocks.length).toBe(1)
        expect(blockchain.blocks[0].height).toBe(0)
        blockchain.validateChain()
    });
    test('Blochain should add valid block',() =>{
        const blockchain = Blockchain.initialize("Test")
        const block = Block.initialize(1,"Block 1",blockchain.blocks[0].hash)
        blockchain.addBlock(block)
        blockchain.validateChain()
    })
    test('Blockchain should not add block with incorrect height or prevBlockHash',() =>{
        const blockchain = Blockchain.initialize("Test")
        const blockWrongHeight = Block.initialize(2,"Block 1",blockchain.blocks[0].hash)
        const blockWrongPrevBlockHash = Block.initialize(1,"Block 1","test")
        expect(() => blockchain.addBlock(blockWrongHeight)).toThrowError()
        expect(() => blockchain.addBlock(blockWrongPrevBlockHash)).toThrowError()
    })
})
