export enum OPCODES{
    PUSH,
    POP,
    ADD,
    SUBTRACT,
    MULTIPLY,
    DIVIDE,
    GET,
    STORE
} 

 export type Instruction =
    | { type: OPCODES.PUSH; value: number }
    | { type: OPCODES.POP }
    | { type: OPCODES.ADD }
    | { type: OPCODES.SUBTRACT }
    | { type: OPCODES.MULTIPLY }
    | { type: OPCODES.DIVIDE }
    | { type: OPCODES.GET; key: number }
    | { type: OPCODES.STORE; key: number }

export class VirtualMachine {
    stack: number[] = [];
    
    constructor(){
    }

    push(value: number) {
        this.stack.push(value);
    }

    pop(): number | undefined {
        return this.stack.pop();
    }

    execute(code: Instruction[], state: Map<number,number> ) {
        const originalState = new Map<number,number>(state)
        
        for (const instruction of code) {
            switch (instruction.type) {
            case OPCODES.PUSH:
                this.push(instruction.value);
                break;
            case OPCODES.POP:
                const popped = this.pop();
                if (popped !== undefined) {
                } else {
                     state.clear()
                    for(const [key, value] of originalState.entries()){
                        state.set(key,value)
                    }
                    throw new Error("Stack is empty")
                }
            break;
            case OPCODES.ADD:
                const addA = this.pop();
                const addB = this.pop();
                if (addA !== undefined && addB !== undefined) {
                    const result = addB + addA;
                    this.push(result);
                } else {
                    state.clear()
                    for(const [key, value] of originalState.entries()){
                        state.set(key,value)
                    }
                    throw new Error("Not enough values on the stack for addition")
                }
            break;
            case OPCODES.SUBTRACT:
                const subA = this.pop();
                const subB = this.pop();
                if (subA !== undefined && subB !== undefined) {
                    const result = subB - subA;
                    this.push(result);
                } else {
                     state.clear()
                    for(const [key, value] of originalState.entries()){
                        state.set(key,value)
                    }
                    throw new Error("Not enough values on the stack for subtraction")
                }
            break;
            case OPCODES.MULTIPLY:
                const mulA = this.pop();
                const mulB = this.pop();
                if (mulA !== undefined && mulB !== undefined) {
                    const result = mulB * mulA;
                    this.push(result);
                } else {
                     state.clear()
                    for(const [key, value] of originalState.entries()){
                        state.set(key,value)
                    }
                    throw new Error("Not enough values on the stack for multiplication")
                }
            break;
            case OPCODES.DIVIDE:
                const divA = this.pop();
                const divB = this.pop();
                if (divA !== undefined && divB !== undefined) {
                    const result = Math.floor(divB / divA);
                    this.push(result);
                } else {
                     state.clear()
                    for(const [key, value] of originalState.entries()){
                        state.set(key,value)
                    }
                    throw new Error("Not enough values on the stack for division")
                }
            break
            case OPCODES.GET:
                const key = instruction.key
                const storedValue = state.get(key)
                if(storedValue !== undefined){
                    this.push(storedValue)
                }else{
                     state.clear()
                    for(const [key, value] of originalState.entries()){
                        state.set(key,value)
                    }
                    throw new Error("No value stored at that key")
                }
            break
            case OPCODES.STORE:
               const stackValue = this.pop()
             if (stackValue !== undefined) {
                 state.set(instruction.key, stackValue)
             } else {
                 state.clear()
                 for(const [key, value] of originalState.entries()){
                     state.set(key,value)
                 }
                 throw new Error("Stack is empty")
             }
            break
            }
        }
        
    }
    
}
