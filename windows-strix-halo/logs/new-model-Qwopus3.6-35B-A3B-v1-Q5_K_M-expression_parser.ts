import * as fs from 'fs';

type Token =
    | { type: 'NUM'; value: number }
    | { type: 'U+' }
    | { type: 'U-' }
    | { type: 'BIN'; op: '+' | '-' | '*' | '/' }
    | { type: 'LPAREN' }
    | { type: 'RPAREN' };

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    let lastTokenType: 'NUM' | 'OP' | 'LPAREN' = 'LPAREN';

    while (i < expr.length) {
        if (expr[i] === ' ') {
            i++;
            continue;
        }

        if (expr[i] >= '0' && expr[i] <= '9') {
            let j = i;
            while (j < expr.length && expr[j] >= '0' && expr[j] <= '9') j++;
            tokens.push({ type: 'NUM', value: parseInt(expr.slice(i, j), 10) });
            lastTokenType = 'NUM';
            i = j;
            continue;
        }

        if (expr[i] === '+' || expr[i] === '-') {
            const isUnary = lastTokenType === 'OP' || lastTokenType === 'LPAREN';
            if (isUnary) {
                tokens.push(expr[i] === '+' ? { type: 'U+' } : { type: 'U-' });
            } else {
                tokens.push({ type: 'BIN', op: expr[i] });
            }
            lastTokenType = 'OP';
            i++;
            continue;
        }

        if (expr[i] === '(') {
            tokens.push({ type: 'LPAREN' });
            lastTokenType = 'LPAREN';
            i++;
            continue;
        }

        if (expr[i] === ')') {
            tokens.push({ type: 'RPAREN' });
            lastTokenType = 'NUM';
            i++;
            continue;
        }

        if (expr[i] === '*' || expr[i] === '/') {
            tokens.push({ type: 'BIN', op: expr[i] });
            lastTokenType = 'OP';
            i++;
            continue;
        }

        i++;
    }

    return tokens;
}

function precedence(token: Token): number {
    switch (token.type) {
        case 'U+':
        case 'U-':
            return 3;
        case 'BIN':
            return token.op === '*' || token.op === '/' ? 2 : 1;
        default:
            return 0;
    }
}

function associativity(token: Token): 'left' | 'right' {
    return (token.type === 'U+' || token.type === 'U-') ? 'right' : 'left';
}

function toRPN(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const operators: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'NUM') {
            output.push(token);
        } else if (token.type === 'LPAREN') {
            operators.push(token);
        } else if (token.type === 'RPAREN') {
            while (operators.length > 0 && operators[operators.length - 1].type !== 'LPAREN') {
                output.push(operators.pop()!);
            }
            if (operators.length === 0) throw new Error('Mismatched parentheses');
            operators.pop();
        } else {
            while (operators.length > 0) {
                const top = operators[operators.length - 1];
                if (top.type === 'LPAREN') break;
                if (
                    precedence(top) > precedence(token) ||
                    (precedence(top) === precedence(token) && associativity(token) === 'left')
                ) {
                    output.push(operators.pop()!);
                } else {
                    break;
                }
            }
            operators.push(token);
        }
    }

    while (operators.length > 0) {
        const op = operators.pop()!;
        if (op.type === 'LPAREN' || op.type === 'RPAREN') throw new Error('Mismatched parentheses');
        output.push(op);
    }

    return output;
}

function evaluateRPN(rpn: Token[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
        if (token.type === 'NUM') {
            stack.push(token.value);
        } else if (token.type === 'U+') {
            if (stack.length < 1) throw new Error('Insufficient operands');
            stack.push(stack[stack.length - 1]);
        } else if (token.type === 'U-') {
            if (stack.length < 1) throw new Error('Insufficient operands');
            stack.push(-stack[stack.length - 1]);
        } else if (token.type === 'BIN') {
            if (stack.length < 2) throw new Error('Insufficient operands');
            const right = stack.pop()!;
            const left = stack.pop()!;
            let result: number;
            switch (token.op) {
                case '+':
                    result = left + right;
                    break;
                case '-':
                    result = left - right;
                    break;
                case '*':
                    result = left * right;
                    break;
                case '/':
                    result = Math.trunc(left / right);
                    break;
            }
            stack.push(result);
        }
    }

    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
}

function main(): void {
    const expression = fs.readFileSync(0, 'utf8').trim();
    const tokens = tokenize(expression);
    const rpn = toRPN(tokens);
    const result = evaluateRPN(rpn);
    console.log(result);
}

main();
