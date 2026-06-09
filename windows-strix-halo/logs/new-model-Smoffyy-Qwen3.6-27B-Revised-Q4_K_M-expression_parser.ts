import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
let pos = 0;
const len = input.length;

function skipSpaces(): void {
    while (pos < len && input[pos] === ' ') pos++;
}

function parseExpr(): number {
    skipSpaces();
    let res = parseTerm();
    while (pos < len && (input[pos] === '+' || input[pos] === '-')) {
        const op = input[pos++];
        skipSpaces();
        const right = parseTerm();
        res = op === '+' ? res + right : res - right;
    }
    return res;
}

function parseTerm(): number {
    skipSpaces();
    let res = parseFactor();
    while (pos < len && (input[pos] === '*' || input[pos] === '/')) {
        const op = input[pos++];
        skipSpaces();
        const right = parseFactor();
        res = op === '*' ? res * right : Math.trunc(res / right);
    }
    return res;
}

function parseFactor(): number {
    skipSpaces();
    if (pos >= len) throw new Error('Unexpected end of input');
    if (input[pos] === '+') {
        pos++;
        return parseFactor();
    }
    if (input[pos] === '-') {
        pos++;
        return -parseFactor();
    }
    if (input[pos] === '(') {
        pos++;
        const res = parseExpr();
        skipSpaces();
        if (pos < len && input[pos] === ')') pos++;
        return res;
    }
    let numStr = '';
    while (pos < len && input[pos] >= '0' && input[pos] <= '9') {
        numStr += input[pos++];
    }
    if (numStr === '') throw new Error('Expected number');
    return Number(numStr);
}

console.log(parseExpr());
