import * as fs from 'fs';

/**
 * A simple arithmetic expression evaluator.
 * Supports integers, + - * /, unary + -, and parentheses.
 * Division truncates toward zero.
 */

type Token =
    | { type: 'Number'; value: number }
    | { type: 'Operator'; value: string; precedence: number; isUnary: boolean }
    | { type: 'LParen' }
    | { type: 'RParen' };

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
        const char = input[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/\d/.test(char)) {
            let numStr = '';
            while (i < input.length && /\d/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'Number', value: parseInt(numStr, 10) });
            continue;
        }

        if (char === '(') {
            tokens.push({ type: 'LParen' });
            i++;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: 'RParen' });
            i++;
            continue;
        }

        if (['+', '-', '*', '/'].includes(char)) {
            // Determine if operator is unary
            // It is unary if it's at the start or follows an operator or '('
            const prev = tokens[tokens.length - 1];
            const isUnary = !prev || (prev.type === 'Operator' || prev.type === 'LParen');
            
            let precedence = 0;
            if (isUnary) {
                precedence = 3; // Highest
            } else {
                if (char === '+' || char === '-') precedence = 1;
                else precedence = 2;
            }

            tokens.push({ 
                type: 'Operator', 
                value: char, 
                precedence, 
                isUnary 
            });
            i++;
            continue;
        }

        i++;
    }
    return tokens;
}

function evaluate(input: string): number {
    const tokens = tokenize(input);
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    // Shunting-yard Algorithm
    for (const token of tokens) {
        if (token.type === 'Number') {
            outputQueue.push(token);
        } else if (token.type === 'LParen') {
            operatorStack.push(token);
        } else if (token.type === 'RParen') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LParen') {
                outputQueue.push(operatorStack.pop()!);
            }
            operatorStack.pop(); // Remove LParen
        } else {
            // Operator
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type === 'Operator' &&
                operatorStack[operatorStack.length - 1].precedence >= token.precedence
            ) {
                outputQueue.push(operatorStack.pop()!);
            }
            operatorStack.push(token);
        }
    }

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop()!);
    }

    // Evaluate Postfix
    const stack: number[] = [];
    for (const token of outputQueue) {
        if (token.type === 'Number') {
            stack.push(token.value);
        } else if (token.type === 'Operator') {
            if (token.isUnary) {
                const a = stack.pop()!;
                switch (token.value) {
                    case '+': stack.push(a); break;
                    case '-': stack.push(-a); break;
                }
            } else {
                const b = stack.pop()!;
                const a = stack.pop()!;
                switch (token.value) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/': 
                        // Truncate toward zero
                        const res = a / b;
                        stack.push(res > 0 ? Math.floor(res) : Math.ceil(res));
                        break;
                }
            }
        }
    }

    return stack[0];
}

const input = fs.readFileSync(0, "utf8").trim();
if (input) {
    console.log(evaluate(input));
}
