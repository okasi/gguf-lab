import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

type TokenType = 'NUMBER' | 'UNARY' | 'BINARY' | 'LPAREN' | 'RPAREN';

interface Token {
    type: TokenType;
    value: string;
    precedence: number;
}

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    let afterNumberOrRParen = false;

    while (i < expr.length) {
        const ch = expr[i];

        if (ch === ' ') {
            i++;
            continue;
        }

        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                num += expr[i++];
            }
            tokens.push({ type: 'NUMBER', value: num, precedence: -1 });
            afterNumberOrRParen = true;
            continue;
        }

        if (ch === '+' || ch === '-') {
            const unary = !afterNumberOrRParen;
            tokens.push({
                type: unary ? 'UNARY' : 'BINARY',
                value: ch,
                precedence: unary ? 3 : 1
            });
            afterNumberOrRParen = false;
            i++;
            continue;
        }

        if (ch === '*' || ch === '/') {
            tokens.push({
                type: 'BINARY',
                value: ch,
                precedence: 2
            });
            afterNumberOrRParen = false;
            i++;
            continue;
        }

        if (ch === '(') {
            tokens.push({ type: 'LPAREN', value: '(', precedence: -1 });
            afterNumberOrRParen = false;
            i++;
            continue;
        }

        if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: ')', precedence: -1 });
            afterNumberOrRParen = true;
            i++;
            continue;
        }

        i++;
    }

    return tokens;
}

function shuntingYard(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const stack: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            output.push(token);
        } else if (token.type === 'UNARY') {
            stack.push(token);
        } else if (token.type === 'BINARY') {
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top.type !== 'LPAREN' && top.precedence >= token.precedence) {
                    output.push(stack.pop()!);
                } else {
                    break;
                }
            }
            stack.push(token);
        } else if (token.type === 'LPAREN') {
            stack.push(token);
        } else if (token.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                output.push(stack.pop()!);
            }
            if (stack.length > 0) {
                stack.pop();
            }
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop()!);
    }

    return output;
}

function evaluateRPN(rpn: Token[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
        if (token.type === 'NUMBER') {
            stack.push(Number(token.value));
        } else if (token.type === 'UNARY') {
            const val = stack.pop()!;
            if (token.value === '+') {
                stack.push(val);
            } else {
                stack.push(-val);
            }
        } else if (token.type === 'BINARY') {
            const right = stack.pop()!;
            const left = stack.pop()!;
            switch (token.value) {
                case '+':
                    stack.push(left + right);
                    break;
                case '-':
                    stack.push(left - right);
                    break;
                case '*':
                    stack.push(left * right);
                    break;
                case '/':
                    stack.push(Math.trunc(left / right));
                    break;
            }
        }
    }

    return stack[0];
}

const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluateRPN(rpn);
console.log(result);
