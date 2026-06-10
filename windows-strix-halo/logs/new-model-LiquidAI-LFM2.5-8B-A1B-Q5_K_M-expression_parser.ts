import fs from 'fs';

function tokenize(expr: string): Array<{type: 'NUMBER' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | '(' | ')' | 'UNARY_MINUS'}> {
    const tokens: Array<{type: 'NUMBER' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | '(' | ')' | 'UNARY_MINUS'}> = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') { i++; continue; }
        if (ch >= '0' && ch <= '9') {
            let num = 0;
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                num = num * 10 + (expr[i] - '0');
                i++;
            }
            tokens.push({type: 'NUMBER', value: num});
        } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
            const isUnary = false;
            if (ch === '-' && (tokens.length === 0 ||
                tokens[tokens.length - 1].type === 'NUMBER' ||
                tokens[tokens.length - 1].type === '(' ||
                tokens[tokens.length - 1].type === 'PLUS' ||
                tokens[tokens.length - 1].type === 'MINUS' ||
                tokens[tokens.length - 1].type === 'UNARY_MINUS')) {
                isUnary = true;
            }
            if (isUnary) {
                tokens.push({type: 'UNARY_MINUS'});
            } else {
                tokens.push({type: ch});
            }
        } else {
            i++;
        }
    }
    return tokens;
}

function shuntingYard(tokens: Array<{type: 'NUMBER' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | '(' | ')' | 'UNARY_MINUS'}>) {
    const precedence = {
        'NUMBER': 0,
        'PLUS': 2,
        'MINUS': 2,
        '*': 3,
        '/': 3,
        '(': 1,
        ')': 1
    };
    const output: Array<string> = [];
    const opStack: string[] = [];

    for (const token of tokens) {
        switch (token.type) {
            case 'NUMBER':
                output.push(token.value.toString());
                break;
            case '(':
                opStack.push(token);
                break;
            case ')':
                while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
                    output.push(opStack.pop() as string);
                }
                opStack.pop(); // remove '('
                break;
            default:
                while (opStack.length > 0 && opStack[opStack.length - 1] !== '(' &&
                      precedence[opStack[opStack.length - 1]] >= precedence[token.type]) {
                    output.push(opStack.pop() as string);
                }
                opStack.push(token);
        }
    }

    while (opStack.length > 0) {
        output.push(opStack.pop() as string);
    }
    return output;
}

function evaluate(rpn: Array<string>) {
    const stack: number[] = [];
    for (const token of rpn) {
        switch (token) {
            case 'NUMBER':
                stack.push(Number(token));
                break;
            case 'PLUS':
            case 'MINUS':
            case 'UNARY_MINUS':
                if (token === 'UNARY_MINUS') {
                    const a = stack.pop();
                    stack.push(-a);
                } else {
                    const b = stack.pop();
                    const a = stack.pop();
                    if (token === 'PLUS') stack.push(a + b);
                    else stack.push(a - b);
                }
                break;
            case '*':
            case '/':
                const b = stack.pop();
                const a = stack.pop();
                if (token === '*') stack.push(a * b);
                else {
                    // truncate toward zero
                    stack.push(Math.trunc(a / b));
                }
                break;
            default:
                throw new Error('Unknown token');
        }
    }
    return stack[0];
}

function main() {
    const data = fs.readFileSync(0, 'utf8').trimEnd('\n').replace(/\r\n/g, '');
    const tokens = tokenize(data);
    const rpn = shuntingYard(tokens);
    console.log(evaluate(rpn));
}

if (require.main === module) {
    main();
