const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();

const tokens: Array<{type: 'NUMBER' | 'PLUS' | 'MINUS' | 'TIMES' | 'DIVIDE' | 'LPAREN' | 'RPAREN'; value: string}> = [];

let i = 0;

function parseNumber(): {type: 'NUMBER'; value: string} | null {
    let num = '';
    while (i < input.length && /[0-9]/.test(input[i])) {
        num += input[i];
        i++;
    }
    if (num.length > 0) {
        return {type: 'NUMBER', value: num};
    }
    return null;
}

function tokenize(): void {
    while (i < input.length) {
        const c = input[i];
        if (/[0-9]/.test(c)) {
            const num = parseNumber();
            if (num) tokens.push(num);
        } else if (c === '+') {
            tokens.push({type: 'PLUS', value: '+'});
            i++;
        } else if (c === '-') {
            tokens.push({type: 'MINUS', value: '-'});
            i++;
        } else if (c === '*') {
            tokens.push({type: 'TIMES', value: '*'});
            i++;
        } else if (c === '/') {
            tokens.push({type: 'DIVIDE', value: '/'});
            i++;
        } else if (c === '(') {
            tokens.push({type: 'LPAREN', value: '('});
            i++;
        } else if (c === ')') {
            tokens.push({type: 'RPAREN', value: ')'});
            i++;
        } else {
            i++; // skip whitespace
        }
    }
}

tokenize();

let pos = 0;

function peek(): {type: 'NUMBER' | 'PLUS' | 'MINUS' | 'TIMES' | 'DIVIDE' | 'LPAREN' | 'RPAREN' | null; value: string} | null {
    if (pos < tokens.length) return tokens[pos];
    return null;
}

function consume(): {type: 'NUMBER' | 'PLUS' | 'MINUS' | 'TIMES' | 'DIVIDE' | 'LPAREN' | 'RPAREN' | null; value: string} | null {
    const token = peek();
    if (token) {
        pos++;
        return token;
    }
    return null;
}

function evalExpression(): number {
    let result = evalTerm();
    while (true) {
        const token = peek();
        if (!token) break;
        if (token.type === 'PLUS') {
            pos++;
            const right = evalTerm();
            result += right;
        } else if (token.type === 'MINUS') {
            pos++;
            const right = evalTerm();
            result -= right;
        } else {
            break;
        }
    }
    return result;
}

function evalTerm(): number {
    let result = evalFactor();
    while (true) {
        const token = peek();
        if (!token) break;
        if (token.type === 'TIMES') {
            pos++;
            const right = evalFactor();
            result *= right;
        } else if (token.type === 'DIVIDE') {
            pos++;
            const right = evalFactor();
            result = Math.trunc(result / right);
        } else {
            break;
        }
    }
    return result;
}

function evalFactor(): number {
    const token = peek();
    if (!token) throw new Error('Unexpected end');
    if (token.type === 'NUMBER') {
        pos++;
        return parseInt(token.value, 10);
    }
    if (token.type === 'LPAREN') {
        pos++;
        const result = evalExpression();
        if (!consume() || consume()?.type !== 'RPAREN') throw new Error('Missing closing paren');
        return result;
    }
    if (token.type === 'PLUS') {
        pos++;
        const result = evalFactor();
        return result;
    }
    if (token.type === 'MINUS') {
        pos++;
        const result = evalFactor();
        return -result;
    }
    throw new Error('Unexpected token');
}

const result = evalExpression();
console.log(result);
