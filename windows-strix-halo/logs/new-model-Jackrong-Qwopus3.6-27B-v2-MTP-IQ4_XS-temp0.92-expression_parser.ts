import * as fs from 'fs';

interface Token {
    type: 'NUMBER' | 'PLUS' | 'MINUS' | 'MULT' | 'DIV' | 'LPAREN' | 'RPAREN';
    value?: number;
}

interface RPNToken {
    type: 'NUMBER' | 'UNARY_PLUS' | 'UNARY_MINUS' | 'BINARY_PLUS' | 'BINARY_MINUS' | 'BINARY_MULT' | 'BINARY_DIV';
    value?: number;
}

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
        const ch = input[i];
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = 0;
            while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                num = num * 10 + (input.charCodeAt(i) - 48);
                i++;
            }
            tokens.push({ type: 'NUMBER', value: num });
        } else if (ch === '+') {
            tokens.push({ type: 'PLUS' });
            i++;
        } else if (ch === '-') {
            tokens.push({ type: 'MINUS' });
            i++;
        } else if (ch === '*') {
            tokens.push({ type: 'MULT' });
            i++;
        } else if (ch === '/') {
            tokens.push({ type: 'DIV' });
            i++;
        } else if (ch === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
        } else if (ch === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
        } else {
            i++;
        }
    }
    return tokens;
}

function isUnaryOperator(tokens: Token[], index: number): boolean {
    if (index === 0) return true;
    if (tokens[index - 1].type === 'LPAREN') return true;
    const prev = tokens[index - 1].type;
    return prev === 'PLUS' || prev === 'MINUS' || prev === 'MULT' || prev === 'DIV';
}

function getPrecedence(tok: Token): number {
    switch (tok.type) {
        case 'MULT': case 'DIV': return 2;
        case 'PLUS': case 'MINUS': return 1;
        default: return 0;
    }
}

function toRPNType(type: 'PLUS' | 'MINUS' | 'MULT' | 'DIV'): string {
    return 'BINARY_' + type;
}

function shuntingYard(tokens: Token[]): RPNToken[] {
    const output: RPNToken[] = [];
    const stack: Token[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.type === 'NUMBER') {
            output.push({ type: 'NUMBER', value: tok.value });
        } else if (tok.type === 'PLUS' || tok.type === 'MINUS') {
            if (isUnaryOperator(tokens, i)) {
                output.push({ type: tok.type === 'PLUS' ? 'UNARY_PLUS' : 'UNARY_MINUS' });
            } else {
                while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN' &&
                    getPrecedence(stack[stack.length - 1]) >= getPrecedence(tok)) {
                    const op = stack.pop()!;
                    output.push({ type: toRPNType(op.type as 'PLUS' | 'MINUS' | 'MULT' | 'DIV') });
                }
                stack.push(tok);
            }
        } else if (tok.type === 'MULT' || tok.type === 'DIV') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN' &&
                getPrecedence(stack[stack.length - 1]) >= getPrecedence(tok)) {
                const op = stack.pop()!;
                output.push({ type: toRPNType(op.type as 'PLUS' | 'MINUS' | 'MULT' | 'DIV') });
            }
            stack.push(tok);
        } else if (tok.type === 'LPAREN') {
            stack.push(tok);
        } else if (tok.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                const op = stack.pop()!;
                output.push({ type: toRPNType(op.type as 'PLUS' | 'MINUS' | 'MULT' | 'DIV') });
            }
            if (stack.length > 0 && stack[stack.length - 1].type === 'LPAREN') {
                stack.pop();
            }
        }
    }

    while (stack.length > 0) {
        const op = stack.pop()!;
        output.push({ type: toRPNType(op.type as 'PLUS' | 'MINUS' | 'MULT' | 'DIV') });
    }

    return output;
}

function evaluate(rpn: RPNToken[]): number {
    const stack: number[] = [];
    for (const tok of rpn) {
        if (tok.type === 'NUMBER') {
            stack.push(tok.value!);
        } else if (tok.type === 'UNARY_PLUS') {
            stack.push(+stack.pop()!);
        } else if (tok.type === 'UNARY_MINUS') {
            stack.push(-stack.pop()!);
        } else if (tok.type === 'BINARY_PLUS') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(a + b);
        } else if (tok.type === 'BINARY_MINUS') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(a - b);
        } else if (tok.type === 'BINARY_MULT') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(a * b);
        } else if (tok.type === 'BINARY_DIV') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push(Math.trunc(a / b));
        }
    }
    return stack.pop()!;
}

const input = fs.readFileSync(0, 'utf8').trim();
const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluate(rpn);
console.log(result);
