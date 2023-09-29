import {describe, expect, test} from '@jest/globals';
import {VirtualMachine, Instruction, OPCODES} from "../src/vm.js"

describe("Virtual Machine tests", () => {
    test("Virtual machine should correctly execute program and alter state", () => {
        //Push 5 onto stack
        //Push 7 onto stack
        //Remove 5 and 7 from stack add them and push result to stack
        //Push 3 onto stack
        //Remove result of adition and 3 from stack multiply and push result to stack
        //Remove result from multiplication from stack and store in state under key 5
        const code: Instruction[] = [
            { type: OPCODES.PUSH, value: 5 },
            { type: OPCODES.PUSH, value: 7 },
            { type: OPCODES.ADD },
            { type: OPCODES.PUSH, value: 3 },
            { type: OPCODES.MULTIPLY },
            { type: OPCODES.STORE, key: 5  },
        ];
        const state = new Map<number,number>()
        const vm = new VirtualMachine()
        vm.execute(code,state)
        expect(vm.stack.length).toBe(0)
        expect(state.get(5)).toBe((5+7)*3)
    })
    test("Virtual machine should throw error if program doesn't execute correctly, and revert state", () => {
        const code: Instruction[] = [
            { type: OPCODES.PUSH, value: 7 },
            { type: OPCODES.STORE, key: 5  },
            { type: OPCODES.ADD },
            { type: OPCODES.PUSH, value: 3 },
            { type: OPCODES.MULTIPLY },
            { type: OPCODES.STORE, key: 5  },
            ];
     
        const state = new Map<number,number>()
        const vm = new VirtualMachine()
        expect(()=> vm.execute(code,state)).toThrowError(new Error("Not enough values on the stack for addition"))
        expect(state.get(5)).toBe(undefined)
    })
    test("Virtual machine should not throw error on empty instruction array, and not modify state", () => {
        const state = new Map<number,number>()
        state.set(20,10)
        const vm = new VirtualMachine()
        vm.execute([],state)
        const state2 = new Map<number,number>()
        state2.set(20,10)
        expect(state).toStrictEqual(state2)
    })
})