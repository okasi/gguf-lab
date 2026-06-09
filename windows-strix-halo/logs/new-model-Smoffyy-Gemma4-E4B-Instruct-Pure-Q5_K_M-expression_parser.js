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
const precedence = {
    'U+': 4, 'U-': 4,
    '*': 3, '/': 3,
    '+': 2, '-': 2,
};
const isOperator = (token) => {
    return ['+', '-', '*', '/', 'U+', 'U-'].includes(token);
};
// --- Lexer (Tokenizer) ---
/**
 * Converts the raw input string into a sequence of tokens.
 * Handles multi-digit numbers, operators, and parentheses.
 * Critically handles the distinction between unary and binary +/-.
 */
function tokenize(input) {
    const tokens = [];
    let i = 0;
    let lastTokenType = 'start';
    const numberRegex = /^\d+(\.\d+)?/;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        // 1. Numbers
        const numMatch = input.substring(i).match(numberRegex);
        if (numMatch) {
            const numStr = numMatch[0];
            tokens.push({ type: 'number', value: parseFloat(numStr) });
            i += numStr.length;
            lastTokenType = 'number';
            continue;
        }
        // 2. Parentheses
        if (char === '(') {
            tokens.push({ type: 'paren', value: char });
            lastTokenType = 'paren_open';
            i++;
            continue;
        }
        if (char === ')') {
            tokens.push({ type: 'paren', value: char });
            lastTokenType = 'number'; // After closing paren, we expect an operator or end
            i++;
            continue;
        }
        // 3. Operators (+, -, *, /)
        if (['+', '-', '*', '/'].includes(char)) {
            let op;
            if (char === '+' || char === '-') {
                // Check for Unary vs Binary
                // Unary if: start of expression, after '(', or after another operator
                if (lastTokenType === 'start' || lastTokenType === 'paren_open' || lastTokenType === 'operator') {
                    op = char === '+' ? 'U+' : 'U-';
                }
                else {
                    op = char === '+' ? '+' : '-';
                }
            }
            else {
                op = char;
            }
            tokens.push({ type: 'operator', value: op });
            i++;
            lastTokenType = 'operator';
            continue;
        }
        throw new Error(`Invalid character in expression: ${char}`);
    }
    return tokens;
}
// --- Shunting Yard Algorithm (Infix to RPN) ---
/**
 * Converts the token list from infix to Reverse Polish Notation (RPN).
 * Uses two stacks: output queue and operator stack.
 */
function shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        }
        else if (token.type === 'operator') {
            const op1 = token.value;
            while (operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type === 'operator') {
                const op2 = operatorStack[operatorStack.length - 1].value;
                // Check precedence and associativity
                // Unary operators are right-associative (precedence 4)
                // Binary operators are left-associative (precedence 2, 3)
                const p1 = precedence[op1];
                const p2 = precedence[op2];
                if ((p2 > p1) ||
                    (p2 === p1 && (op1 !== 'U+' && op1 !== 'U-')) // Left associativity for binary operators
                ) {
                    outputQueue.push(operatorStack.pop());
                }
                else {
                    break;
                }
            }
            operatorStack.push(token);
        }
        else if (token.type === 'paren') {
            if (token.value === '(') {
                operatorStack.push(token);
            }
            else if (token.value === ')') {
                // Pop operators until the matching '(' is found
                let foundParen = false;
                while (operatorStack.length > 0) {
                    const top = operatorStack[operatorStack.length - 1];
                    if (top.type === 'paren' && top.value === '(') {
                        operatorStack.pop(); // Discard '('
                        foundParen = true;
                        break;
                    }
                    outputQueue.push(operatorStack.pop());
                }
                if (!foundParen) {
                    throw new Error("Mismatched parentheses");
                }
            }
        }
    }
    // Pop any remaining operators from the stack to the output queue
    while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'paren') {
            throw new Error("Mismatched parentheses");
        }
        outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
}
// --- RPN Evaluation ---
/**
 * Performs the calculation based on the operator.
 * Handles integer division truncating toward zero.
 */
function applyOperation(op, b, a) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b === 0)
                throw new Error("Division by zero");
            // Truncates toward zero (standard integer division behavior)
            return Math.trunc(a / b);
        case 'U+': return a;
        case 'U-': return -a;
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}
/**
 * Evaluates the expression represented in Reverse Polish Notation (RPN).
 */
function evaluateRPN(rpnTokens) {
    const stack = [];
    for (const token of rpnTokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        }
        else if (token.type === 'operator') {
            const op = token.value;
            if (op.startsWith('U')) {
                // Unary operator: requires 1 operand
                if (stack.length < 1)
                    throw new Error("Invalid RPN expression: Unary operator requires one operand.");
                const operand = stack.pop();
                const result = applyOperation(op, operand, 0); // second argument unused
                stack.push(result);
            }
            else {
                // Binary operator: requires 2 operands (a op b)
                if (stack.length < 2)
                    throw new Error("Invalid RPN expression: Binary operator requires two operands.");
                const b = stack.pop();
                const a = stack.pop();
                const result = applyOperation(op, b, a);
                stack.push(result);
            }
        }
    }
    if (stack.length !== 1) {
        throw new Error("Invalid RPN expression: Too many operands left.");
    }
    return stack[0];
}
// --- Main Execution ---
function main() {
    try {
        // Read input from standard input (file descriptor 0)
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input)
            return;
        // 1. Tokenize
        const tokens = tokenize(input);
        // 2. Convert to RPN
        const rpnTokens = shuntingYard(tokens);
        // 3. Evaluate RPN
        const result = evaluateRPN(rpnTokens);
        console.log(result);
    }
    catch (e) {
        // Handle parsing or runtime errors
        if (e instanceof Error) {
            console.error(`Error: ${e.message}`);
        }
        else {
            console.error("An unknown error occurred.");
        }
        process.exit(1);
    }
}
main();
