"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
/**
 * Custom Tokenizer/Lexer
 * Splits the input string into a sequence of meaningful tokens.
 */
class Lexer {
    constructor(input) {
        this.position = 0;
        this.input = input;
    }
    skipWhitespace() {
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++;
        }
    }
    nextToken() {
        this.skipWhitespace();
        if (this.position >= this.input.length) {
            return { type: "eof" };
        }
        let char = this.input[this.position];
        // 1. Number Token
        if (/\d/.test(char)) {
            let numStr = "";
            while (this.position < this.input.length && /\d/.test(this.input[this.position])) {
                numStr += this.input[this.position];
                this.position++;
            }
            const value = parseInt(numStr, 10);
            return { type: "number", value };
        }
        // 2. Parentheses
        if (char === "(") {
            this.position++;
            return { type: "paren", value: "(" };
        }
        if (char === ")") {
            this.position++;
            return { type: "paren", value: ")" };
        }
        // 3. Operator Tokens
        if ("+-*/".includes(char)) {
            const op = char;
            this.position++;
            // Context check for Unary operators:
            // If the previous token was an operator or an opening parenthesis,
            // or if this is the first token, the sign is unary.
            // This simple lexer assumes operators are always single characters.
            // We handle the unary distinction during the Shunting-Yard phase
            // by treating '+' and '-' as distinct tokens based on context.
            return { type: "operator", value: op };
        }
        throw new Error(`Unexpected character: ${char} at position ${this.position}`);
    }
}
/**
 * Shunting-Yard Algorithm Implementation (Infix to Postfix Conversion)
 */
class Parser {
    constructor() {
        // Precedence map: Higher number means higher precedence
        this.precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            'U_PLUS': 3, // Unary Plus
            'U_MINUS': 3, // Unary Minus
        };
    }
    isOperator(token) {
        return token.type === "operator";
    }
    isNumber(token) {
        return token.type === "number";
    }
    /**
     * Converts tokens from infix notation to Reverse Polish Notation (RPN).
     * @param tokens The list of tokens produced by the Lexer.
     * @returns The list of tokens in RPN order.
     */
    toRPN(tokens) {
        const outputQueue = [];
        const operatorStack = [];
        // We need a way to track context for unary operators
        // True if the last token was an operator or an opening parenthesis, or if it's the start.
        let expectingUnary = true;
        for (const token of tokens) {
            if (this.isNumber(token)) {
                outputQueue.push(token);
                expectingUnary = false;
            }
            else if (token.type === "paren" && token.value === "(") {
                outputQueue.push(token);
                operatorStack.push(token);
                // After '(', we expect a number or a unary sign
                expectingUnary = true;
            }
            else if (token.type === "paren" && token.value === ")") {
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== "(") {
                    outputQueue.push(operatorStack.pop());
                }
                if (operatorStack[operatorStack.length - 1].value !== "(") {
                    throw new Error("Mismatched parentheses");
                }
                operatorStack.pop(); // Pop the '('
                expectingUnary = false;
            }
            else if (this.isOperator(token)) {
                const opValue = token.value;
                // Handle Unary vs. Binary Distinction
                if (opValue === "+" || opValue === "-") {
                    if (expectingUnary) {
                        // Convert unary sign into a specific token type
                        const unaryOp = opValue === "-" ? "U_MINUS" : "U_PLUS";
                        const unaryToken = { type: "operator", value: unaryOp };
                        outputQueue.push(unaryToken);
                        // Unary operator doesn't change the expectation state for the next token
                        continue;
                    }
                }
                // Standard Binary Operator Handling
                let currentPrecedence = this.precedence[opValue];
                while (operatorStack.length > 0) {
                    const topToken = operatorStack[operatorStack.length - 1];
                    if (topToken.type === "paren" && topToken.value === "(")
                        break;
                    const topOp = topToken.value;
                    let topPrecedence = this.precedence[topOp] || 0;
                    // Check for left-associativity (all binary ops here are left-associative)
                    if (topPrecedence > currentPrecedence) {
                        outputQueue.push(operatorStack.pop());
                    }
                    else {
                        break;
                    }
                }
                operatorStack.push(token);
                expectingUnary = true;
            }
        }
        while (operatorStack.length > 0) {
            const op = operatorStack.pop();
            if (op.value === "(")
                throw new Error("Mismatched parentheses");
            outputQueue.push(op);
        }
        return outputQueue;
    }
}
/**
 * Evaluator for Reverse Polish Notation (RPN)
 */
class RPNCalculator {
    calculate(rpnTokens) {
        const stack = [];
        for (const token of rpnTokens) {
            if (token.type === "number") {
                stack.push(token.value);
            }
            else if (token.type === "operator") {
                const op = token.value;
                if (op === 'U_MINUS' || op === 'U_PLUS') {
                    // Unary Operation
                    if (stack.length < 1)
                        throw new Error("Insufficient operands for unary operation.");
                    const operand = stack.pop();
                    if (op === 'U_MINUS') {
                        stack.push(-operand);
                    }
                    else { // U_PLUS
                        stack.push(operand);
                    }
                }
                else {
                    // Binary Operation
                    if (stack.length < 2)
                        throw new Error("Insufficient operands for binary operation.");
                    const b = stack.pop();
                    const a = stack.pop();
                    let result;
                    switch (op) {
                        case '+':
                            result = a + b;
                            break;
                        case '-':
                            result = a - b;
                            break;
                        case '*':
                            result = a * b;
                            break;
                        case '/':
                            // Division truncates toward zero (Math.trunc)
                            // Note: JS division yields float, Math.trunc ensures integer result
                            result = Math.trunc(a / b);
                            break;
                        default:
                            throw new Error(`Unknown operator: ${op}`);
                    }
                    stack.push(result);
                }
            }
        }
        if (stack.length !== 1) {
            throw new Error("Invalid expression: Stack size is not 1 at the end.");
        }
        return stack[0];
    }
}
/**
 * Main Execution Function
 */
function solve() {
    // Read all input from stdin (file descriptor 0)
    const inputData = fs.readFileSync(0, "utf8").trim();
    if (inputData === "") {
        return;
    }
    try {
        // 1. Lexing
        const lexer = new Lexer(inputData);
        const tokens = [];
        let token;
        do {
            token = lexer.nextToken();
            tokens.push(token);
        } while (token.type !== "eof");
        // 2. Parsing (Infix to RPN)
        const parser = new Parser();
        const rpnTokens = parser.toRPN(tokens);
        // 3. Evaluation
        const calculator = new RPNCalculator();
        const result = calculator.calculate(rpnTokens);
        console.log(result);
    }
    catch (e) {
        // In a real production environment, we would log this error.
        // For this challenge, we assume valid input leading to a single integer output.
        // console.error(e);
    }
}
solve();
