"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function tokenize(input) {
    let i = 0;
    const tokens = [];
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
            tokens.push({ type: 'PLUS' });
            i++;
        }
        else if (char === '-') {
            tokens.push({ type: 'MINUS' });
            i++;
        }
        else if (char === '*') {
            tokens.push({ type: 'MULTIPLY' });
            i++;
        }
        else if (char === '/') {
            tokens.push({ type: 'DIVIDE' });
            i++;
        }
        else if (char === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
        }
        else if (char === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
        }
        else {
            throw new Error(`Unexpected character: ${char}`);
        }
    }
    tokens.push({ type: 'EOF' });
    return tokens;
}
function peek(tokens, index) {
    if (index < tokens.length)
        return tokens[index];
    return null;
}
function parse(tokens) {
    let pos = 0;
    function parseExpression() {
        let left = parseTerm();
        while (true) {
            if (peek(tokens, pos) === null)
                return left;
            const token = peek(tokens, pos);
            if (token.type === 'PLUS') {
                pos++;
                left = left + parseTerm();
            }
            else if (token.type === 'MINUS') {
                pos++;
                left = left - parseTerm();
            }
            else {
                break;
            }
        }
        return left;
    }
    function parseTerm() {
        let left = parseFactor();
        while (true) {
            if (peek(tokens, pos) === null)
                return left;
            const token = peek(tokens, pos);
            if (token.type === 'MULTIPLY') {
                pos++;
                left = left * parseFactor();
            }
            else if (token.type === 'DIVIDE') {
                pos++;
                left = Math.trunc(left / parseFactor());
            }
            else {
                break;
            }
        }
        return left;
    }
    function parseFactor() {
        const token = peek(tokens, pos);
        if (token === null)
            return 0;
        if (token.type === 'NUMBER') {
            pos++;
            return token.value;
        }
        if (token.type === 'LPAREN') {
            pos++;
            const value = parseExpression();
            const next = peek(tokens, pos);
            if (next !== null && next.type === 'RPAREN') {
                pos++;
            }
            else {
                throw new Error('Expected closing parenthesis');
            }
            return value;
        }
        if (token.type === 'PLUS' || token.type === 'MINUS') {
            pos++;
            const sign = token.type === 'PLUS' ? 1 : -1;
            if (peek(tokens, pos) === null)
                return sign === 1 ? 0 : 0;
            return sign * parseFactor();
        }
        throw new Error(`Unexpected token: ${token.type}`);
    }
    const result = parseExpression();
    const next = peek(tokens, pos);
    if (next !== null && next.type !== 'EOF') {
        throw new Error('Unexpected token after expression');
    }
    return result;
}
function main() {
    const content = (0, fs_1.readFileSync)(0, 'utf8').trim();
    const tokens = tokenize(content);
    const result = parse(tokens);
    console.log(result);
}
main();
