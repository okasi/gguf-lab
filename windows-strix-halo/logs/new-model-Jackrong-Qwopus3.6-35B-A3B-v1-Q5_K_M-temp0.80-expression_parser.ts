import * as fs from 'fs';

function tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < expression.length) {
        const c = expression[i];
        if (c === ' ') {
            i++;
            continue;
        }
        if (/\d/.test(c)) {
            let num = '';
            while (i < expression.length && /\d/.test(expression[i])) {
                num += expression[i];
                i++;
            }
            tokens.push(num);
            continue;
        }
        if (c === '+' || c === '-') {
            if (i === 0 || tokens.length === 0 || tokens[tokens.length - 1] === '(' || tokens[tokens.length - 1] === '+' || tokens[tokens.length - 1] === '-' || tokens[tokens.length - 1] === '*' || tokens[tokens.length - 1] === '/' || tokens[tokens.length - 1] === 'u+' || tokens[tokens.length - 1] === 'u-') {
                tokens.push(c === '+' ? 'u+' : 'u-');
            } else {
                tokens.push(c);
            }
        } else if (c === '*' || c === '/') {
            tokens.push(c);
        } else if (c === '(') {
            tokens.push('(');
        } else if (c === ')') {
            tokens.push(')');
        }
        i++;
    }
    return tokens;
}

function getPrecedence(op: string): number {
    if (op === 'u+' || op === 'u-') return 3;
    if (op === '*' || op === '/') return 2;
    if (op === '+' || op === '-') return 1;
    return 0;
}

function shuntingYard(tokens: string[]): string[] {
    const output: string[] = [];
    const stack: string[] = [];
    for (const token of tokens) {
        if (!isNaN(Number(token))) {
            output.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output.push(stack.pop()!);
            }
            stack.pop();
        } else {
            while (stack.length > 0 && stack[stack.length - 1] !== '(' &&
                (getPrecedence(stack[stack.length - 1]) > getPrecedence(token) ||
                    (getPrecedence(stack[stack.length - 1]) === getPrecedence(token) && token !== 'u+' && token !== 'u-'))) {
                output.push(stack.pop()!);
            }
            stack.push(token);
        }
    }
    while (stack.length > 0) {
        output.push(stack.pop()!);
    }
    return output;
}

function evaluatePostfix(postfix: string[]): number {
    const stack: number[] = [];
    for (const token of postfix) {
        if (!isNaN(Number(token))) {
            stack.push(Number(token));
        } else if (token === 'u+') {
            stack.push(stack.pop()!);
        } else if (token === 'u-') {
            stack.push(-stack.pop()!);
        } else if (token === '+' || token === '-' || token === '*' || token === '/') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            if (token === '+') stack.push(a + b);
            else if (token === '-') stack.push(a - b);
            else if (token === '*') stack.push(a * b);
            else stack.push(Math.trunc(a / b));
        }
    }
    return stack[0];
}

function evaluate(expression: string): number {
    const tokens = tokenize(expression);
    const postfix = shuntingYard(tokens);
    return evaluatePostfix(postfix);
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
