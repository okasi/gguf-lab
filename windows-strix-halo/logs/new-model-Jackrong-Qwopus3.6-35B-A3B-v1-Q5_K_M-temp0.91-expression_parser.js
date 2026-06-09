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
    const len = input.length;
    while (i < len) {
        const c = input[i];
        if (c === ' ') {
            i++;
            continue;
        }
        if (c === '+') {
            tokens.push({ type: 'PLUS' });
            i++;
        }
        else if (c === '-') {
            tokens.push({ type: 'MINUS' });
            i++;
        }
        else if (c === '*') {
            tokens.push({ type: 'STAR' });
            i++;
        }
        else if (c === '/') {
            tokens.push({ type: 'SLASH' });
            i++;
        }
        else if (c === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
        }
        else if (c === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
        }
        else if (/\d/.test(c)) {
            let j = i;
            while (j < len && /\d/.test(input[j])) {
                j++;
            }
            tokens.push({ type: 'NUM', value: parseInt(input.slice(i, j), 10) });
            i = j;
        }
        else {
            throw new Error(`Unexpected character: ${c}`);
        }
    }
    tokens.push({ type: 'EOF' });
    return tokens;
}
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        const token = this.tokens[this.pos];
        this.pos++;
        return token;
    }
    expect(expectedType) {
        const token = this.consume();
        if (token.type !== expectedType) {
            throw new Error(`Expected ${expectedType}, got ${token.type}`);
        }
    }
    evaluate(left, op, right) {
        switch (op) {
            case 'PLUS': return left + right;
            case 'MINUS': return left - right;
            case 'STAR': return left * right;
            case 'SLASH': return Math.trunc(left / right);
            default: throw new Error(`Unknown operator: ${op}`);
        }
    }
    parse() {
        return this.parseExpression();
    }
    parseExpression() {
        let left = this.parseTerm();
        while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
            const op = this.consume();
            const right = this.parseTerm();
            left = this.evaluate(left, op.type, right);
        }
        return left;
    }
    parseTerm() {
        let left = this.parseUnary();
        while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
            const op = this.consume();
            const right = this.parseUnary();
            left = this.evaluate(left, op.type, right);
        }
        return left;
    }
    parseUnary() {
        const token = this.peek();
        if (token.type === 'PLUS') {
            this.consume();
            return this.parseUnary();
        }
        if (token.type === 'MINUS') {
            this.consume();
            return -this.parseUnary();
        }
        return this.parseAtom();
    }
    parseAtom() {
        const token = this.peek();
        if (token.type === 'LPAREN') {
            this.consume();
            const result = this.parseExpression();
            this.expect('RPAREN');
            return result;
        }
        if (token.type === 'NUM') {
            this.consume();
            return token.value;
        }
        throw new Error(`Unexpected token: ${token.type}`);
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
if (input.length === 0) {
    throw new Error('Empty input');
}
const tokens = tokenize(input);
const parser = new Parser(tokens);
console.log(parser.parse());
