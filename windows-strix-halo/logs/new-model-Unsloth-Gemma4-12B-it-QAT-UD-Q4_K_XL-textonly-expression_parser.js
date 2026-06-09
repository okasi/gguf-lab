"use strict";
const fs = require('fs');
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = "";
            while (i < input.length && /[\d.]/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
            continue;
        }
        if (char === '+') {
            // Check if unary: preceded by start of expr or an operator/LParen
            const prev = tokens[tokens.length - 1];
            if (!prev || prev.type === 'LPAREN' || ['PLUS', 'MINUS', 'MUL', 'DIV', 'UNARY_PLUS', 'UNARY_MINUS'].includes(prev.type)) {
                tokens.push({ type: 'UNARY_PLUS', value: '+' });
            }
            else {
                tokens.push({ type: 'PLUS', value: '+' });
            }
        }
        else if (char === '-') {
            const prev = tokens[tokens.length - 1];
            if (!prev || prev.type === 'LPAREN' || ['PLUS', 'MINUS', 'MUL', 'DIV', 'UNARY_PLUS', 'UNARY_MINUS'].includes(prev.type)) {
                tokens.push({ type: 'UNARY_MINUS', value: '-' });
            }
            else {
                tokens.push({ type: 'MINUS', value: '-' });
            }
        }
        else if (char === '*') {
            tokens.push({ type: 'MUL', value: '*' });
        }
        else if (char === '/') {
            tokens.push({ type: 'DIV', value: '/' });
        }
        else if (char === '(') {
            tokens.push({ type: 'LPAREN', value: '(' });
        }
        else if (char === ')') {
            tokens.push({ type: 'RPAREN', value: ')' });
        }
        i++;
    }
    return tokens;
}
function evaluate(tokens) {
    const ops = [];
    const values = [];
    const precedence = {
        'UNARY_PLUS': 3,
        'UNARY_MINUS': 3,
        'MUL': 2,
        'DIV': 2,
        'PLUS': 1,
        'MINUS': 1,
    };
    const applyOp = () => {
        const op = ops.pop();
        if (op.type === 'UNARY_PLUS' || op.type === 'UNARY_MINUS') {
            const val = values.pop();
            values.push(op.type === 'UNARY_PLUS' ? val : -val);
        }
        else {
            const b = values.pop();
            const a = values.pop();
            if (op.type === 'PLUS')
                values.push(a + b);
            else if (op.type === 'MINUS')
                values.push(a - b);
            else if (op.type === 'MUL')
                values.push(a * b);
            else if (op.type === 'DIV') {
                // Truncate toward zero
                const res = a / b;
                values.push(res > 0 ? Math.floor(res) : Math.ceil(res));
            }
        }
    };
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'NUMBER') {
            values.push(token.value);
        }
        else if (token.type === 'LPAREN') {
            ops.push(token);
        }
        else if (token.type === 'RPAREN') {
            while (ops.length > 0 && ops[ops.length - 1].type !== 'LPAREN') {
                applyOp();
            }
            ops.pop(); // Remove LPAREN
        }
        else {
            while (ops.length > 0 &&
                ops[ops.length - 1].type !== 'LPAREN' &&
                precedence[ops[ops.length - 1].type] >= precedence[token.type]) {
                applyOp();
            }
            ops.push(token);
        }
    }
    while (ops.length > 0) {
        applyOp();
    }
    return values[0];
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input)
            return;
        const tokens = tokenize(input);
        const result = evaluate(tokens);
        process.stdout.write(result.toString() + '\n');
    }
    catch (e) {
        // Handle or ignore
    }
}
main();
