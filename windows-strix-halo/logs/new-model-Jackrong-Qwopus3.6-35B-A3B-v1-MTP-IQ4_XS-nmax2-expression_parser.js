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
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const c = input[i];
        if (c === ' ' || c === '\t') {
            i++;
            continue;
        }
        if (c === '(') {
            tokens.push({ type: 'lparen' });
            i++;
            continue;
        }
        if (c === ')') {
            tokens.push({ type: 'rparen' });
            i++;
            continue;
        }
        if (c === '+' || c === '-' || c === '*' || c === '/') {
            tokens.push({ type: 'op', value: c });
            i++;
            continue;
        }
        // number
        let start = i;
        while (i < input.length && (input[i] >= '0' && input[i] <= '9')) {
            i++;
        }
        tokens.push({ type: 'num', value: parseInt(input.substring(start, i), 10) });
    }
    return tokens;
}
// Shunting-yard algorithm to convert to RPN
function toRPN(tokens) {
    const output = [];
    const ops = [];
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };
    for (let j = 0; j < tokens.length; j++) {
        const token = tokens[j];
        if (token.type === 'num') {
            output.push(token);
        }
        else if (token.type === 'lparen') {
            ops.push(token);
        }
        else if (token.type === 'rparen') {
            while (ops.length > 0 && ops[ops.length - 1].type !== 'lparen') {
                output.push(ops.pop());
            }
            if (ops.length === 0) {
                throw new Error('Mismatched parentheses');
            }
            ops.pop(); // remove lparen
        }
        else if (token.type === 'op') {
            while (ops.length > 0 &&
                ops[ops.length - 1].type === 'op' &&
                precedence[ops[ops.length - 1].value] >= precedence[token.value]) {
                output.push(ops.pop());
            }
            ops.push(token);
        }
    }
    while (ops.length > 0) {
        const op = ops.pop();
        if (op.type === 'lparen') {
            throw new Error('Mismatched parentheses');
        }
        output.push(op);
    }
    return output;
}
// Evaluate RPN
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token.type === 'num') {
            stack.push(token.value);
        }
        else if (token.type === 'op') {
            if (stack.length < 2) {
                throw new Error('Invalid expression');
            }
            const b = stack.pop();
            const a = stack.pop();
            let result;
            switch (token.value) {
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
                    if (b === 0) {
                        throw new Error('Division by zero');
                    }
                    // Truncate toward zero
                    result = Math.trunc(a / b);
                    break;
                default:
                    throw new Error('Unknown operator');
            }
            stack.push(result);
        }
    }
    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }
    return stack[0];
}
// Handle unary +/- by inserting 0 before the operator
function insertUnaryZeros(tokens) {
    const result = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'op' && (token.value === '+' || token.value === '-')) {
            // Check if it's unary:
            // It's unary if:
            // - It's the first token
            // - The previous token is an operator, lparen, or unary op
            const isUnary = i === 0 ||
                tokens[i - 1].type === 'op' ||
                tokens[i - 1].type === 'lparen' ||
                (tokens[i - 1].type === 'op' &&
                    (tokens[i - 1].value === '+' || tokens[i - 1].value === '-'));
            if (isUnary) {
                // Insert 0 before the unary operator
                result.push({ type: 'num', value: 0 });
            }
            result.push(token);
        }
        else {
            result.push(token);
        }
    }
    return result;
}
function evaluate(input) {
    const tokens = tokenize(input);
    const tokensWithUnary = insertUnaryZeros(tokens);
    const rpn = toRPN(tokensWithUnary);
    return evaluateRPN(rpn);
}
const input = fs.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
