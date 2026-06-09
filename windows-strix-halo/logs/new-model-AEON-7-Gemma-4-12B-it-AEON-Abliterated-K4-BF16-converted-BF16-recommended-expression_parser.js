"use strict";
const fs = require('fs');
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input)
        return;
    const tokens = tokenize(input);
    const result = evaluate(tokens);
    process.stdout.write(result.toString() + '\n');
}
function tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < str.length && /\d/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            tokens.push({ type: 'NUM', value: parseInt(numStr, 10) });
            continue;
        }
        if ('+-*/()'.includes(char)) {
            tokens.push({ type: 'OP', value: char });
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
function evaluate(tokens) {
    // Pre-process to distinguish unary vs binary operators
    const processed = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'OP' && ['+', '-'].includes(token.value)) {
            const prev = i > 0 ? tokens[i - 1] : null;
            const isUnary = !prev || (prev.type === 'OP' && prev.value !== ')');
            if (isUnary) {
                processed.push({ type: 'UNARY', value: token.value });
            }
            else {
                processed.push({ type: 'BINARY', value: token.value });
            }
        }
        else {
            processed.push(token);
        }
    }
    const ops = [];
    const values = [];
    const precedence = {
        '+': 1, '-': 1,
        '*': 2, '/': 2,
        'UNARY': 3
    };
    const applyOp = () => {
        const op = ops.pop();
        if (op.type === 'UNARY') {
            const val = values.pop();
            values.push(op.value === '-' ? -val : val);
        }
        else {
            const right = values.pop();
            const left = values.pop();
            switch (op.value) {
                case '+':
                    values.push(left + right);
                    break;
                case '-':
                    values.push(left - right);
                    break;
                case '*':
                    values.push(left * right);
                    break;
                case '/':
                    values.push(Math.trunc(left / right));
                    break;
            }
        }
    };
    for (const token of processed) {
        if (token.type === 'NUM') {
            values.push(token.value);
        }
        else if (token.value === '(') {
            ops.push({ type: 'PAREN', value: '(' });
        }
        else if (token.value === ')') {
            while (ops.length > 0 && ops[ops.length - 1].value !== '(') {
                applyOp();
            }
            ops.pop();
        }
        else {
            const currentPrec = token.type === 'UNARY' ? precedence['UNARY'] : precedence[token.value];
            while (ops.length > 0 &&
                ops[ops.length - 1].value !== '(' &&
                (ops[ops.length - 1].type === 'UNARY' || precedence[ops[ops.length - 1].value] >= currentPrec)) {
                // Special case: unary operators are right-associative, 
                // but since we are building a simple parser, standard precedence works
                if (token.type === 'UNARY' && ops[ops.length - 1].type === 'UNARY')
                    break;
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
solve();
