import {describe, expect, test} from "@jest/globals";
import{Block} from "../src/block.js";

describe("Block tests", () => {
    test("Block should initialize and pass verification", () => {
        const block = Block.initialize(0,"Test", "prevHash")
        expect(block.height).toBe(0)
        expect(block.data).toBe("Test")
        expect(block.prevBlockHash).toBe("prevHash")
        expect(block.hash).toBe(block.calculateHash())
        block.verify()
    });
    test("Block that had any field altered should fail verification",() =>{
        const block = Block.initialize(0,"Test", "")
        block.height = 1
        expect(() => block.verify()).toThrowError()
    })
})
