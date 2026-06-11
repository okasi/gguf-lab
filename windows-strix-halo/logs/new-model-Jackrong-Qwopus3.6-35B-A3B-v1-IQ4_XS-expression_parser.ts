import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

// Tokenizer: splits the expression into numbers, operators, and parentheses
type Token = { type: 'num', value: number } | { type: 'op', value: string };

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < expr.length) {
        const char = expr[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char });
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let num = '';
            while (i < expr.length && /[0-9]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            tokens.push({ type: 'num', value: parseInt(num, 10) });
            continue;
        }
        if (char === '+' || char === '-' || char === '*' || char === '/') {
            tokens.push({ type: 'op', value: char });
            i++;
            continue;
        }
        // Ignore unknown characters or handle error
        i++;
    }
    return tokens;
}

// Shunting-yard algorithm to convert infix to postfix (RPN)
function shuntingYard(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const operators: Token[] = [];

    const precedence: { [key: string]: number } = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };

    // We need to handle unary operators. A '+' or '-' is unary if:
    // 1. It is the first token.
    // 2. The previous token is an operator (including '(').
    // We will handle unary operators by treating them as functions or by inserting a special marker.
    // Alternatively, we can preprocess the token stream to insert implicit 0 for unary minus/plus?
    // No, better to handle in parsing or use a recursive descent parser.
    // Given the requirement for a "real parser", a recursive descent is often cleaner for unary ops.
    // Let's switch to a recursive descent parser for simplicity and correctness with unary operators.
    
    return output; // Will rewrite below
}

// Recursive Descent Parser
// Grammar:
// expr -> term (('+' | '-') term)*
// term -> unary (('*' | '/') unary)*
// unary -> ('+' | '-') unary | primary
// primary -> '(' expr ')' | number

let pos: number;
let tokens: Token[];

function peek(): Token | undefined {
    if (pos < tokens.length) {
        return tokens[pos];
    }
    return undefined;
}

function consume(expectedType: string, expectedValue?: string): Token {
    const token = tokens[pos];
    if (!token) {
        throw new Error(`Unexpected end of input, expected ${expectedType} ${expectedValue}`);
    }
    if (token.type !== expectedType) {
        throw new Error(`Expected ${expectedType} ${expectedValue} but got ${token.type} ${token.value}`);
    }
    if (expectedValue !== undefined && token.value !== expectedValue) {
        throw new Error(`Expected ${expectedValue} but got ${token.value}`);
    }
    pos++;
    return token;
}

function parseExpr(): number {
    let result = parseTerm();

    while (true) {
        const token = peek();
        if (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
            consume('op');
            const right = parseTerm();
            if (token.value === '+') {
                result = result + right;
            } else {
                result = result - right;
            }
        } else {
            break;
        }
    }

    return result;
}

function parseTerm(): number {
    let result = parseUnary();

    while (true) {
        const token = peek();
        if (token && token.type === 'op' && (token.value === '*' || token.value === '/')) {
            consume('op');
            const right = parseUnary();
            if (token.value === '*') {
                result = result * right;
            } else {
                // Truncate toward zero
                if (right === 0) {
                    throw new Error("Division by zero");
                }
                result = Math.trunc(result / right);
            }
        } else {
            break;
        }
    }

    return result;
}

function parseUnary(): number {
    const token = peek();
    if (token && token.type === 'op' && (token.value === '+' || token.value === '-')) {
        consume('op');
        const operand = parseUnary();
        if (token.value === '-') {
            return -operand;
        } else {
            return operand;
        }
    } else {
        return parsePrimary();
    }
}

function parsePrimary(): number {
    const token = peek();
    
    if (token && token.type === 'num') {
        consume('num');
        return token.value;
    }

    if (token && token.type === 'paren' && token.value === '(') {
        consume('paren');
        const result = parseExpr();
        consume('paren', ')');
        return result;
    }

    throw new Error(`Unexpected token: ${token ? token.value : 'end of input'}`);
}

try {
    tokens = tokenize(input);
    pos = 0;
    const result = parseExpr();
    console.log(result);
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
