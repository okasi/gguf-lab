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
 * Tokenizes the input arithmetic expression string.
 * Handles numbers, operators, parentheses, and distinguishes between binary and unary signs.
 * @param expression The input expression string.
 * @returns An array of tokens.
 */
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    const n = expression.length;
    while (i < n) {
        let char = expression[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let numStr = '';
            while (i < n && /[0-9]/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
            continue;
        }
        if (char === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
            continue;
        }
        if (char === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
            continue;
        }
        if (char === '+' || char === '-') {
            // Look ahead to determine if the sign is unary or binary
            const isStart = i === 0 || expression[i - 1] === '(' || expression[i - 1] === ' ' || expression[i - 1] === '*';
            if (isStart) {
                // Unary sign: We treat unary + as identity (skip it) and unary - as a special indicator
                // For simplicity in the Shunting Yard/RPN, we'll handle unary minus by pushing a '0' followed by the '-' operator
                // but since the requirement implies standard arithmetic structure, we will inject a 0 for unary minus.
                if (char === '-') {
                    tokens.push({ type: 'NUMBER', value: 0 });
                    tokens.push({ type: 'OPERATOR_MINUS' });
                }
                else if (char === '+') {
                    // Unary plus is ignored (treated as 0 + X)
                    i++;
                    continue;
                }
            }
            else {
                // Binary sign
                if (char === '+') {
                    tokens.push({ type: 'OPERATOR_PLUS' });
                }
                else {
                    tokens.push({ type: 'OPERATOR_MINUS' });
                }
            }
            i++;
            continue;
        }
        if (char === '*' || char === '/') {
            if (char === '*') {
                tokens.push({ type: 'OPERATOR_MULTIPLY' });
            }
            else { // '/'
                tokens.push({ type: 'OPERATOR_DIVIDE' });
            }
            i++;
            continue;
        }
        // Should not happen based on problem constraints
        throw new Error(`Unexpected character: ${char}`);
    }
    tokens.push({ type: 'EOF' });
    return tokens;
}
// Operator precedence: Higher number means higher precedence
const precedence = {
    'OPERATOR_PLUS': 1,
    'OPERATOR_MINUS': 1,
    'OPERATOR_MULTIPLY': 2,
    'OPERATOR_DIVIDE': 2,
};
// Shunting-yard implementation to convert infix to Reverse Polish Notation (RPN)
function shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    for (const token of tokens.filter(t => t.type !== 'EOF')) {
        switch (token.type) {
            case 'NUMBER':
                outputQueue.push(token);
                break;
            case 'LPAREN':
                operatorStack.push(token);
                break;
            case 'RPAREN':
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
                    outputQueue.push(operatorStack.pop());
                }
                if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
                    throw new Error("Mismatched parentheses");
                }
                operatorStack.pop(); // Discard '('
                break;
            case 'OPERATOR_PLUS':
            case 'OPERATOR_MINUS':
            case 'OPERATOR_MULTIPLY':
            case 'OPERATOR_DIVIDE':
                const op1 = token;
                while (operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1].type !== 'LPAREN' &&
                    (precedence[operatorStack[operatorStack.length - 1].type] >= precedence[op1.type])) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(op1);
                break;
        }
    }
    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op.type === 'LPAREN' || op.type === 'RPAREN') {
            throw new Error("Mismatched parentheses remaining");
        }
        outputQueue.push(op);
    }
    return outputQueue;
}
// Evaluates the RPN expression
function evaluateRPN(rpnTokens) {
    const stack = [];
    for (const token of rpnTokens) {
        if (token.type === 'NUMBER') {
            stack.push(token.value);
        }
        else if (token.type === 'OPERATOR_PLUS' || token.type === 'OPERATOR_MINUS' || token.type === 'OPERATOR_MULTIPLY' || token.type === 'OPERATOR_DIVIDE') {
            if (stack.length < 2) {
                throw new Error("Invalid RPN expression: insufficient operands");
            }
            const b = stack.pop();
            const a = stack.pop();
            let result;
            switch (token.type) {
                case 'OPERATOR_PLUS':
                    result = a + b;
                    break;
                case 'OPERATOR_MINUS':
                    result = a - b;
                    break;
                case 'OPERATOR_MULTIPLY':
                    result = a * b;
                    break;
                case 'OPERATOR_DIVIDE':
                    // Truncate toward zero for division
                    result = Math.trunc(a / b);
                    break;
                default:
                    throw new Error("Unknown operator");
            }
            stack.push(result);
        }
    }
    if (stack.length !== 1) {
        throw new Error("Invalid RPN expression: too many operands left");
    }
    return stack[0];
}
function solve() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, 'utf8').trim();
        if (!input)
            return;
        // 1. Tokenize
        const tokens = tokenize(input);
        // 2. Convert to RPN
        const rpn = shuntingYard(tokens);
        // 3. Evaluate RPN
        const result = evaluateRPN(rpn);
        console.log(result);
    }
    catch (error) {
        // In a strict contest environment, errors might need specific handling, 
        // but for robust execution, we log if necessary.
        // console.error(error);
    }
}
solve();
