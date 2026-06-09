import * as fs from 'fs';

type TokenType = 'NUMBER' | 'UNARY_PLUS' | 'UNARY_MINUS' | 'BIN_PLUS' | 'BIN_MINUS' | 'TIMES' | 'DIVIDE' | 'LPAREN' | 'RPAREN';

interface Token {
    type: TokenType;
    value: number;
}

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch === '(') {
            tokens.push({ type: 'LPAREN', value: 0 });
            i++;
        } else if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: 0 });
            i++;
        } else if (ch === '*' || ch === '/') {
            tokens.push({ type: ch === '*' ? 'TIMES' : 'DIVIDE', value: 0 });
            i++;
        } else if (ch === '+' || ch === '-') {
            // Determine unary or binary
            if (tokens.length === 0 || tokens[tokens.length - 1].type === 'LPAREN' ||
                tokens[tokens.length - 1].type === 'UNARY_PLUS' || tokens[tokens.length - 1].type === 'UNARY_MINUS' ||
                tokens[tokens.length - 1].type === 'BIN_PLUS' || tokens[tokens.length - 1].type === 'BIN_MINUS' ||
                tokens[tokens.length - 1].type === 'TIMES' || tokens[tokens.length - 1].type === 'DIVIDE') {
                tokens.push({ type: ch === '+' ? 'UNARY_PLUS' : 'UNARY_MINUS', value: 0 });
            } else {
                tokens.push({ type: ch === '+' ? 'BIN_PLUS' : 'BIN_MINUS', value: 0 });
            }
            i++;
        } else if (ch >= '0' && ch <= '9') {
            let num = 0;
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                num = num * 10 + (expr[i] - '0');
                i++;
            }
            tokens.push({ type: 'NUMBER', value: num });
        } else {
            i++;
        }
    }
    return tokens;
}

function precedence(t: TokenType): number {
    switch (t) {
        case 'UNARY_PLUS':
        case 'UNARY_MINUS':
            return 4;
        case 'TIMES':
        case 'DIVIDE':
            return 3;
        case 'BIN_PLUS':
        case 'BIN_MINUS':
            return 2;
        default:
            return 0;
    }
}

function isLeftAssociative(t: TokenType): boolean {
    return t !== 'UNARY_PLUS' && t !== 'UNARY_MINUS';
}

function toRPN(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const stack: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            output.push(token);
        } else if (token.type === 'UNARY_PLUS' || token.type === 'UNARY_MINUS' ||
                   token.type === 'BIN_PLUS' || token.type === 'BIN_MINUS' ||
                   token.type === 'TIMES' || token.type === 'DIVIDE') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                const top = stack[stack.length - 1].type;
                if (isOperator(top) && (precedence(top) > precedence(token.type) ||
                    (precedence(top) === precedence(token.type) && isLeftAssociative(token.type)))) {
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
            if (stack.length > 0) stack.pop(); // pop the '('
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop()!);
    }

    return output;
}

function isOperator(t: TokenType): boolean {
    return t !== 'NUMBER' && t !== 'LPAREN' && t !== 'RPAREN';
}

function evaluateRPN(rpn: Token[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
        if (token.type === 'NUMBER') {
            stack.push(token.value);
        } else if (token.type === 'UNARY_PLUS') {
            const a = stack.pop()!;
            stack.push(+a);
        } else if (token.type === 'UNARY_MINUS') {
            const a = stack.pop()!;
            stack.push(-a);
        } else if (token.type === 'BIN_PLUS') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(a + b);
        } else if (token.type === 'BIN_MINUS') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(a - b);
        } else if (token.type === 'TIMES') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(a * b);
        } else if (token.type === 'DIVIDE') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            // Truncate toward zero
            stack.push(Math.trunc(a / b));
        }
    }

    return stack[0];
}

const expr = fs.readFileSync(0, 'utf8').trim();
const tokens = tokenize(expr);
const rpn = toRPN(tokens);
const result = evaluateRPN(rpn);
console.log(result);
