import * as fs from 'fs';

function tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch === '(' || ch === ')' || ch === '*' || ch === '/') {
            tokens.push(ch);
            i++;
            continue;
        }
        if (ch === '+' || ch === '-') {
            const isUnary = tokens.length === 0 || tokens[tokens.length - 1] === '(' || tokens[tokens.length - 1] === '+' || tokens[tokens.length - 1] === '-' || tokens[tokens.length - 1] === '*' || tokens[tokens.length - 1] === '/';
            if (isUnary) {
                tokens.push(ch);
                i++;
                continue;
            }
        }
        let num = '';
        while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9')) {
            num += expr[i];
            i++;
        }
        if (num.length > 0) {
            tokens.push(num);
        }
    }
    return tokens;
}

function precedence(op: string): number {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
}

function isAssociativeRight(op: string): boolean {
    return op === '+' || op === '-';
}

function infixToRPN(tokens: string[]): string[] {
    const output: string[] = [];
    const opStack: string[] = [];
    let lastWasNumberOrParenthesis = false;

    for (const token of tokens) {
        if (token === '(') {
            opStack.push(token);
            lastWasNumberOrParenthesis = false;
        } else if (token === ')') {
            while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
                output.push(opStack.pop()!);
            }
            opStack.pop();
            lastWasNumberOrParenthesis = false;
        } else if (token === '+' || token === '-') {
            while (
                opStack.length > 0 &&
                opStack[opStack.length - 1] !== '(' &&
                !(token === '+' || token === '-') &&
                precedence(opStack[opStack.length - 1]) > precedence(token) &&
                (isAssociativeRight(opStack[opStack.length - 1]) === false || isAssociativeRight(opStack[opStack.length - 1]) !== isAssociativeRight(token))
            ) {
                output.push(opStack.pop()!);
            }
            while (
                opStack.length > 0 &&
                opStack[opStack.length - 1] !== '(' &&
                precedence(opStack[opStack.length - 1]) === precedence(token) &&
                isAssociativeRight(opStack[opStack.length - 1]) === false
            ) {
                output.push(opStack.pop()!);
            }
            opStack.push(token);
            lastWasNumberOrParenthesis = false;
        } else if (token === '*' || token === '/') {
            while (
                opStack.length > 0 &&
                opStack[opStack.length - 1] !== '(' &&
                precedence(opStack[opStack.length - 1]) > precedence(token)
            ) {
                output.push(opStack.pop()!);
            }
            opStack.push(token);
            lastWasNumberOrParenthesis = false;
        } else {
            output.push(token);
            lastWasNumberOrParenthesis = true;
        }
    }

    while (opStack.length > 0) {
        output.push(opStack.pop()!);
    }

    return output;
}

function evaluateRPN(rpn: string[]): number {
    const stack: number[] = [];
    for (const token of rpn) {
        if (token === '+' || token === '-' || token === '*' || token === '/') {
            if (stack.length < 2) {
                throw new Error('Invalid expression');
            }
            const b = stack.pop()!;
            const a = stack.pop()!;
            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    if (b === 0) {
                        throw new Error('Division by zero');
                    }
                    stack.push(Math.trunc(a / b));
                    break;
            }
        } else {
            stack.push(parseInt(token, 10));
        }
    }
    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }
    return stack[0];
}

function evaluate(expr: string): number {
    const tokens = tokenize(expr);
    const rpn = infixToRPN(tokens);
    return evaluateRPN(rpn);
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
