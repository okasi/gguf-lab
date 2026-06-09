"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Tokenizer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
    }
    peek() {
        return this.pos < this.input.length ? this.input[this.pos] : undefined;
    }
    consume() {
        if (this.pos < this.input.length) {
            const char = this.input[this.pos];
            this.pos++;
            return char;
        }
        return undefined;
    }
    skipSpaces() {
        while (this.peek() !== undefined && (this.peek() === ' ' || this.peek() === '\n' || this.peek() === '\t')) {
            this.pos++;
        }
    }
    tokenize() {
        const tokens = [];
        while (this.peek() !== undefined) {
            this.skipSpaces();
            if (this.peek() === undefined) {
                tokens.push({ type: 'EOF', value: 0 });
                break;
            }
            if (this.peek() !== undefined && this.peek() !== ' ' && this.peek() !== '\n' && this.peek() !== '\t') {
                if (this.peek() === '0' || this.peek() === '1' || this.peek() === '2' || this.peek() === '3' || this.peek() === '4' || this.peek() === '5' || this.peek() === '6' || this.peek() === '7' || this.peek() === '8' || this.peek() === '9') {
                    const numStr = this.consumeNumber();
                    tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
                }
                else if (this.peek() === '(') {
                    tokens.push({ type: 'LPAREN', value: 0 });
                    this.consume();
                }
                else if (this.peek() === ')') {
                    tokens.push({ type: 'RPAREN', value: 0 });
                    this.consume();
                }
                else if (this.peek() === '+') {
                    this.consume();
                }
                else if (this.peek() === '-') {
                    this.consume();
                }
                else if (this.peek() === '*') {
                    this.consume();
                }
                else if (this.peek() === '/') {
                    this.consume();
                }
            }
        }
        tokens.push({ type: 'EOF', value: 0 });
        return tokens;
    }
    consumeNumber() {
        let numStr = '';
        while (this.peek() !== undefined && (this.peek() === '0' || this.peek() === '1' || this.peek() === '2' || this.peek() === '3' || this.peek() === '4' || this.peek() === '5' || this.peek() === '6' || this.peek() === '7' || this.peek() === '8' || this.peek() === '9' || this.peek() === '.')) {
            numStr += this.consume();
        }
        return numStr;
    }
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
    parse() {
        return this.expression();
    }
    expression() {
        let left = this.term();
        while (this.peek().type === 'BINARY_PLUS' || this.peek().type === 'BINARY_MINUS') {
            const op = this.consume();
            const right = this.term();
            if (op.type === 'BINARY_PLUS') {
                left = left + right;
            }
            else {
                left = left - right;
            }
        }
        return left;
    }
    term() {
        let left = this.factor();
        while (this.peek().type === 'BINARY_MUL' || this.peek().type === 'BINARY_DIV') {
            const op = this.consume();
            const right = this.factor();
            if (op.type === 'BINARY_MUL') {
                left = left * right;
            }
            else {
                left = Math.trunc(left / right);
            }
        }
        return left;
    }
    factor() {
        const token = this.peek();
        if (token.type === 'UNARY_PLUS') {
            this.consume();
            return this.factor();
        }
        if (token.type === 'UNARY_MINUS') {
            this.consume();
            return -this.factor();
        }
        if (token.type === 'UNARY_DIV') {
            this.consume();
            return 1 / this.factor();
        }
        if (token.type === 'NUMBER') {
            this.consume();
            return token.value;
        }
        if (token.type === 'LPAREN') {
            this.consume();
            const result = this.expression();
            this.consume();
            return result;
        }
        return 0;
    }
}
function evaluateExpression(expression) {
    const tokenizer = new Tokenizer(expression);
    const tokens = tokenizer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
}
const input = (0, fs_1.readFileSync)(0, 'utf8').trim();
console.log(evaluateExpression(input));
