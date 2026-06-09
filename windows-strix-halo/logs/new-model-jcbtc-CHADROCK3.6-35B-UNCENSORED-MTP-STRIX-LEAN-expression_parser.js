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
function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens);
    return parser.parse();
}
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (char === ' ') {
            i++;
            continue;
        }
        if (char >= '0' && char <= '9') {
            let numStr = '';
            while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
        }
        else if (char === '+') {
            tokens.push({ type: 'PLUS', value: 0 });
            i++;
        }
        else if (char === '-') {
            tokens.push({ type: 'MINUS', value: 0 });
            i++;
        }
        else if (char === '*') {
            tokens.push({ type: 'MULTIPLY', value: 0 });
            i++;
        }
        else if (char === '/') {
            tokens.push({ type: 'DIVIDE', value: 0 });
            i++;
        }
        else if (char === '(') {
            tokens.push({ type: 'LPAREN', value: 0 });
            i++;
        }
        else if (char === ')') {
            tokens.push({ type: 'RPAREN', value: 0 });
            i++;
        }
        else {
            throw new Error(`Unexpected character: ${char}`);
        }
    }
    return tokens;
}
class Parser {
    constructor(tokens) {
        this.pos = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        const token = this.tokens[this.pos];
        if (!token) {
            throw new Error('Unexpected end of input');
        }
        this.pos++;
        return token;
    }
    parse() {
        const result = this.parseExpression();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected token after expression');
        }
        return result;
    }
    // Lowest precedence: + and -
    parseExpression() {
        let left = this.parseTerm();
        while (this.peek()?.type === 'PLUS' || this.peek()?.type === 'MINUS') {
            const op = this.consume();
            const right = this.parseTerm();
            if (op.type === 'PLUS') {
                left = left + right;
            }
            else {
                left = left - right;
            }
        }
        return left;
    }
    // Medium precedence: * and /
    parseTerm() {
        let left = this.parseUnary();
        while (this.peek()?.type === 'MULTIPLY' || this.peek()?.type === 'DIVIDE') {
            const op = this.consume();
            const right = this.parseUnary();
            if (op.type === 'MULTIPLY') {
                left = left * right;
            }
            else {
                // Division truncates toward zero
                if (right === 0) {
                    throw new Error('Division by zero');
                }
                left = Math.trunc(left / right);
            }
        }
        return left;
    }
    // Highest precedence: unary +/- and primary expressions
    parseUnary() {
        if (this.peek()?.type === 'PLUS' || this.peek()?.type === 'MINUS') {
            const op = this.consume();
            const value = this.parseUnary();
            if (op.type === 'MINUS') {
                return -value;
            }
            else {
                return value;
            }
        }
        return this.parsePrimary();
    }
    // Primary: numbers and parenthesized expressions
    parsePrimary() {
        const token = this.peek();
        if (!token) {
            throw new Error('Unexpected end of input');
        }
        if (token.type === 'NUMBER') {
            this.consume();
            return token.value;
        }
        else if (token.type === 'LPAREN') {
            this.consume(); // consume '('
            const result = this.parseExpression();
            const close = this.consume();
            if (close.type !== 'RPAREN') {
                throw new Error('Expected closing parenthesis');
            }
            return result;
        }
        else {
            throw new Error(`Unexpected token: ${token.type}`);
        }
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const result = evaluateExpression(input);
console.log(result);
