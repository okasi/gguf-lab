"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Tokenizer {
    constructor(input) {
        this.pos = 0;
        this.input = input;
    }
    peek() {
        return this.pos < this.input.length ? this.input[this.pos] : '';
    }
    advance() {
        return this.input[this.pos++];
    }
    skipWhitespace() {
        while (this.pos < this.input.length && /\s/.test(this.peek())) {
            this.advance();
        }
    }
    tokenize() {
        const tokens = [];
        while (this.pos < this.input.length) {
            this.skipWhitespace();
            if (this.pos >= this.input.length)
                break;
            const ch = this.advance();
            if (/\d/.test(ch)) {
                let numStr = ch;
                while (this.pos < this.input.length && /\d/.test(this.peek())) {
                    numStr += this.advance();
                }
                tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
            }
            else if (ch === '+') {
                tokens.push({ type: 'PLUS', value: 0 });
            }
            else if (ch === '-') {
                tokens.push({ type: 'MINUS', value: 0 });
            }
            else if (ch === '*') {
                tokens.push({ type: 'STAR', value: 0 });
            }
            else if (ch === '/') {
                tokens.push({ type: 'SLASH', value: 0 });
            }
            else if (ch === '(') {
                tokens.push({ type: 'LPAREN', value: 0 });
            }
            else if (ch === ')') {
                tokens.push({ type: 'RPAREN', value: 0 });
            }
            else {
                // Skip unknown characters
                this.pos--;
            }
        }
        tokens.push({ type: 'EOF', value: 0 });
        return tokens;
    }
}
class Parser {
    constructor(tokens) {
        this.pos = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.pos];
    }
    advance() {
        return this.tokens[this.pos++];
    }
    parse() {
        const result = this.parseExpression();
        if (this.peek().type !== 'EOF') {
            throw new Error('Unexpected token after expression');
        }
        return result;
    }
    parseExpression() {
        let left = this.parseUnary();
        while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
            const op = this.advance();
            const right = this.parseUnary();
            if (op.type === 'PLUS') {
                left = left + right;
            }
            else {
                left = left - right;
            }
        }
        return left;
    }
    parseUnary() {
        if (this.peek().type === 'PLUS') {
            this.advance();
            return this.parseUnary();
        }
        if (this.peek().type === 'MINUS') {
            this.advance();
            return -this.parseUnary();
        }
        return this.parseTerm();
    }
    parseTerm() {
        let left = this.parsePrimary();
        while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
            const op = this.advance();
            const right = this.parsePrimary();
            if (op.type === 'STAR') {
                left = left * right;
            }
            else {
                left = Math.trunc(left / right);
            }
        }
        return left;
    }
    parsePrimary() {
        const token = this.peek();
        if (token.type === 'NUMBER') {
            this.advance();
            return token.value;
        }
        if (token.type === 'LPAREN') {
            this.advance();
            const result = this.parseExpression();
            if (this.peek().type === 'RPAREN') {
                this.advance();
            }
            return result;
        }
        throw new Error(`Unexpected token: ${token.type}`);
    }
}
const input = fs_1.default.readFileSync(0, 'utf8').trim();
const tokenizer = new Tokenizer(input);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens);
const result = parser.parse();
console.log(result);
