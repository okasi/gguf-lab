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
const input = fs.readFileSync(0, "utf8").trim();
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const char = expr[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char });
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let num = '';
            while (i < expr.length && /[0-9]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            tokens.push({ type: 'num', value: parseInt(num, 10) });
            continue;
        }
        if (char === '+' || char === '-' || char === '*' || char === '/') {
            tokens.push({ type: 'op', value: char });
            i++;
            continue;
        }
        // Ignore unknown characters or handle error
        i++;
    }
    return tokens;
}
// Shunting-yard algorithm to convert infix to postfix (RPN)
function shuntingYard(tokens) {
    const output = [];
    const operators = [];
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };
    // We need to handle unary operators. A '+' or '-' is unary if:
    // 1. It is the first token.
    // 2. The previous token is an operator (including '(').
    // We will handle unary operators by treating them as functions or by inserting a special marker.
    // Alternatively, we can preprocess the token stream to insert implicit 0 for unary minus/plus?
    // No, better to handle in parsing or use a recursive descent parser.
    // Given the requirement for a "real parser", a recursive descent is often cleaner for unary ops.
    // Let's switch to a recursive descent parser for simplicity and correctness with unary operators.
    return output; // Will rewrite below
}
// Recursive Descent Parser
// Grammar:
// expr -> term (('+' | '-') term)*
// term -> unary (('*' | '/') unary)*
// unary -> ('+' | '-') unary | primary
// primary -> '(' expr ')' | number
let pos;
let tokens;
function peek() {
    if (pos < tokens.length) {
        return tokens[pos];
    }
    return undefined;
}
function consume(expectedType, expectedValue) {
    const token = tokens[pos];
    if (!token) {
        throw new Error(`Unexpected end of input, expected ${expectedType} ${expectedValue}`);
    }
    if (token.type !== expectedType) {
        throw new Error(`Expected ${expectedType} ${expectedValue} but got ${token.type} ${token.value}`);
    }
    if (expectedValue !== undefined && token.value !== expectedValue) {
        throw new Error(`Expected ${expectedValue} but got ${token.value}`);
    }
    pos++;
    return token;
}
function parseExpr() {
    let result = parseTerm();
    while (true) {
        const token = peek();
        if (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
            consume('op');
            const right = parseTerm();
            if (token.value === '+') {
                result = result + right;
            }
            else {
                result = result - right;
            }
        }
        else {
            break;
        }
    }
    return result;
}
function parseTerm() {
    let result = parseUnary();
    while (true) {
        const token = peek();
        if (token && token.type === 'op' && (token.value === '*' || token.value === '/')) {
            consume('op');
            const right = parseUnary();
            if (token.value === '*') {
                result = result * right;
            }
            else {
                // Truncate toward zero
                if (right === 0) {
                    throw new Error("Division by zero");
                }
                result = Math.trunc(result / right);
            }
        }
        else {
            break;
        }
    }
    return result;
}
function parseUnary() {
    const token = peek();
    if (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
        consume('op');
        const operand = parseUnary();
        if (token.value === '-') {
            return -operand;
        }
        else {
            return operand;
        }
    }
    else {
        return parsePrimary();
    }
}
function parsePrimary() {
    const token = peek();
    if (token && token.type === 'num') {
        consume('num');
        return token.value;
    }
    if (token && token.type === 'paren' && token.value === '(') {
        consume('paren');
        const result = parseExpr();
        consume('paren', ')');
        return result;
    }
    throw new Error(`Unexpected token: ${token ? token.value : 'end of input'}`);
}
try {
    tokens = tokenize(input);
    pos = 0;
    const result = parseExpr();
    console.log(result);
}
catch (e) {
    console.error(e.message);
    process.exit(1);
}
