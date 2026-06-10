import * as fs from "fs";

function evaluateExpression(expression: string): number {
    const tokens: number[] = [];
    const operators: string[] = [];
    const precedence: { [key: string]: number } = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };
    const unaryPrecedence: number = 3;

    let currentToken = '';
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (char === ' ') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            i++;
            continue;
        }
        if (char === '(') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            operators.push('(');
            i++;
            continue;
        }
        if (char === ')') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                const op = operators.pop()!;
                const b = tokens.pop()!;
                const a = tokens.pop()!;
                if (op === '+') tokens.push(a + b);
                else if (op === '-') tokens.push(a - b);
                else if (op === '*') tokens.push(a * b);
                else if (op === '/') tokens.push(Math.trunc(a / b));
            }
            if (operators.length > 0 && operators[operators.length - 1] === '(') {
                operators.pop();
            }
            i++;
            continue;
        }
        if (char === '+' || char === '-' || char === '*' || char === '/') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            // Check for unary + or -
            if ((char === '+' || char === '-') && (tokens.length === 0 || operators[operators.length - 1] === '(')) {
                operators.push(char);
                i++;
                continue;
            }
            // Check for precedence
            while (operators.length > 0 && operators[operators.length - 1] !== '(' &&
                   precedence[operators[operators.length - 1]] >= precedence[char]) {
                const op = operators.pop()!;
                const b = tokens.pop()!;
                const a = tokens.pop()!;
                if (op === '+') tokens.push(a + b);
                else if (op === '-') tokens.push(a - b);
                else if (op === '*') tokens.push(a * b);
                else if (op === '/') tokens.push(Math.trunc(a / b));
            }
            operators.push(char);
            i++;
            continue;
        }
        currentToken += char;
        i++;
    }
    if (currentToken !== '') {
        tokens.push(parseInt(currentToken, 10));
    }
    while (operators.length > 0) {
        const op = operators.pop()!;
        if (op === '+' || op === '-' || op === '*' || op === '/') {
            const b = tokens.pop()!;
            const a = tokens.pop()!;
            if (op === '+') tokens.push(a + b);
            else if (op === '-') tokens.push(a - b);
            else if (op === '*') tokens.push(a * b);
            else if (op === '/') tokens.push(Math.trunc(a / b));
        }
    }
    return tokens[0];
}

const input = fs.readFileSync(0, "utf8").trim();
console.log(evaluateExpression(input));
