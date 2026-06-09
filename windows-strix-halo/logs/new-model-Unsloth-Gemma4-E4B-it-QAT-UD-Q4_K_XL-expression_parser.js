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
 * Evaluates an arithmetic expression.
 * Supports +, -, *, /, and unary +/-, with parentheses.
 * Division truncates toward zero.
 * @param expression The arithmetic expression string.
 * @returns The result of the evaluation.
 */
function evaluate(expression) {
    // Tokenization and Preprocessing
    let tokens = [];
    let i = 0;
    const len = expression.length;
    // Insert spaces around operators and parentheses to simplify splitting,
    // but handle existing spaces correctly.
    let processedExpression = expression
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .replace(/\*/g, " * ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " - ");
    // Clean up multiple spaces
    while (processedExpression.includes("  ")) {
        processedExpression = processedExpression.replace("  ", " ");
    }
    const parts = processedExpression.trim().split(/\s+/).filter(s => s.length > 0);
    // Handle unary operators during tokenization/parsing phase
    // We'll treat the initial tokens as strings and resolve unary operators during shunting-yard or direct evaluation.
    let rawTokens = [];
    for (let j = 0; j < parts.length; j++) {
        const part = parts[j];
        if (!isNaN(parseInt(part)) || part === '(' || part === ')' || part === '*' || part === '+' || part === '-') {
            rawTokens.push(part);
        }
        else if (part === '+' || part === '-') {
            // Look ahead to determine if '+' or '-' is unary
            const isUnary = j === 0 || rawTokens[rawTokens.length - 1] === '(' ||
                (rawTokens[rawTokens.length - 1] === '+' || rawTokens[rawTokens.length - 1] === '-');
            if (isUnary) {
                // Replace unary + with 0 + or just treat it as a sign modification
                // To simplify, we replace unary '-' with a special marker or prepend '0'
                if (part === '-') {
                    rawTokens.push('UNARY_MINUS');
                }
                else if (part === '+') {
                    // Unary + does nothing mathematically, can be skipped or treated as 0 +
                    // For simplicity, we skip unary '+'
                }
            }
            else {
                rawTokens.push(part);
            }
        }
    }
    const operators = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        'UNARY_MINUS': 3, // Highest precedence
    };
    const precedence = (op) => operators[op] || 0;
    const isOperator = (token) => operators[token] !== undefined;
    // Convert string tokens to structured tokens
    const structuredTokens = rawTokens.map(token => {
        if (!isNaN(parseFloat(token)) && token.trim() !== '') {
            return { type: 'number', value: token };
        }
        if (token === '(' || token === ')') {
            return { type: 'paren', value: token };
        }
        if (isOperator(token)) {
            return { type: 'operator', value: token };
        }
        // Should not happen if tokenization is perfect
        throw new Error(`Unknown token: ${token}`);
    });
    const outputQueue = [];
    const operatorStack = [];
    for (const token of structuredTokens) {
        if (token.type === 'number') {
            outputQueue.push(token.value);
        }
        else if (token.type === 'operator') {
            const op1 = token.value;
            while (operatorStack.length > 0) {
                const topToken = operatorStack[operatorStack.length - 1];
                if (topToken === '(')
                    break;
                if (isOperator(topToken)) {
                    const op2 = topToken;
                    // Check precedence: op2 should have higher or equal precedence than op1
                    // Unary minus always has highest precedence (3)
                    if (precedence(op2) >= precedence(op1)) {
                        outputQueue.push(operatorStack.pop());
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            operatorStack.push(op1);
        }
        else if (token.type === 'paren') {
            if (token.value === '(') {
                operatorStack.push(token.value);
            }
            else { // token.value === ')'
                let foundMatch = false;
                while (operatorStack.length > 0) {
                    const top = operatorStack.pop();
                    if (top === '(') {
                        foundMatch = true;
                        break;
                    }
                    outputQueue.push(top);
                }
                if (!foundMatch) {
                    throw new Error("Mismatched parentheses.");
                }
            }
        }
    }
    // Pop remaining operators
    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === '(' || op === ')') {
            throw new Error("Mismatched parentheses remaining.");
        }
        outputQueue.push(op);
    }
    // --- Reverse Polish Notation (RPN) Evaluation ---
    const stack = [];
    for (const token of outputQueue) {
        if (!isNaN(parseFloat(token))) {
            stack.push(parseFloat(token));
        }
        else {
            const operator = token;
            if (operator === 'UNARY_MINUS') {
                const operand = stack.pop();
                if (operand === undefined)
                    throw new Error("Syntax error: Unary minus requires an operand.");
                stack.push(-operand);
            }
            else {
                const rhs = stack.pop();
                const lhs = stack.pop();
                if (lhs === undefined || rhs === undefined) {
                    throw new Error(`Syntax error: Binary operator ${operator} requires two operands.`);
                }
                let result;
                switch (operator) {
                    case '+':
                        result = lhs + rhs;
                        break;
                    case '-':
                        result = lhs - rhs;
                        break;
                    case '*':
                        result = lhs * rhs;
                        break;
                    case '/':
                        // Truncates toward zero (like Math.trunc)
                        result = Math.trunc(lhs / rhs);
                        break;
                    default:
                        throw new Error(`Unknown operator: ${operator}`);
                }
                stack.push(result);
            }
        }
    }
    if (stack.length !== 1) {
        throw new Error("Evaluation error: Invalid expression structure.");
    }
    return Math.trunc(stack[0]);
}
// Main execution block
try {
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length > 0) {
        const result = evaluate(input);
        console.log(result);
    }
}
catch (e) {
    // In a competitive programming context, error handling might be omitted or simplified.
    // console.error(e); 
}
