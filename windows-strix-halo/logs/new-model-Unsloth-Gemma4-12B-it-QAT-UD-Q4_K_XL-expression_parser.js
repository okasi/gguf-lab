"use strict";
const fs = require('fs');
/**
 * Tokenizer to break the string into Numbers, Operators, and Parentheses
 */
class Tokenizer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
    }
    tokenize() {
        const tokens = [];
        while (this.pos < this.input.length) {
            const char = this.input[this.pos];
            if (/\s/.test(char)) {
                this.pos++;
                continue;
            }
            if (/\d/.test(char)) {
                let numStr = "";
                while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
                    numStr += this.input[this.pos];
                    this.pos++;
                }
                tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
                continue;
            }
            if ("+-*/()".includes(char)) {
                tokens.push({ type: 'OPERATOR', value: char });
                this.pos++;
                continue;
            }
            this.pos++;
        }
        return tokens;
    }
}
/**
 * Parser that handles precedence:
 * 1. Unary (+, -)
 * 2. Multiplication/Division (*, /)
 * 3. Addition/Subtraction (+, -)
 */
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    parse() {
        return this.expression();
    }
    expression() {
        let result = this.term();
        while (this.current < this.tokens.length && (this.tokens[this.current].value === '+' || this.tokens[this.current].value === '-')) {
            const op = this.tokens[this.current].value;
            this.current++;
            const right = this.term();
            if (op === '+')
                result += right;
            else
                result -= right;
        }
        return result;
    }
    term() {
        let result = this.unary();
        while (this.current < this.tokens.length && (this.tokens[this.current].value === '*' || this.tokens[this.current].value === '/')) {
            const op = this.tokens[this.current].value;
            this.current++;
            const right = this.unary();
            if (op === '*') {
                result *= right;
            }
            else {
                // Division truncates toward zero
                const div = result / right;
                result = div > 0 ? Math.floor(div) : Math.ceil(div);
            }
        }
        return result;
    }
    unary() {
        if (this.current < this.tokens.length && (this.tokens[this.current].value === '+' || this.tokens[this.current].value === '-')) {
            const op = this.tokens[this.current].value;
            this.current++;
            const value = this.unary();
            return op === '+' ? value : -value;
        }
        return this.factor();
    }
    factor() {
        const token = this.tokens[this.current];
        if (token.type === 'NUMBER') {
            this.current++;
            return token.value;
        }
        else if (token.value === '(') {
            this.current++;
            const result = this.expression();
            this.current++; // skip ')'
            return result;
        }
        return 0;
    }
}
function solve() {
    try {
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input)
            return;
        const tokens = new Tokenizer(input).tokenize();
        const parser = new Parser(tokens);
        const result = parser.parse();
        process.stdout.write(result.toString() + '\n');
    }
    catch (e) {
        // Silent fail for invalid inputs
    }
}
solve();
