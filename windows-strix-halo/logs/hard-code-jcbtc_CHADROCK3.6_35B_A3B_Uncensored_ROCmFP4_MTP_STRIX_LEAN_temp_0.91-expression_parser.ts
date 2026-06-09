import * as fs from "fs";

function evaluateExpression(expr: string): number {
    const tokens: string[] = tokenize(expr);
    const parser = new Parser(tokens);
    return parser.parseExpression();
}

function tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    const s = expr.trim();
    while (i < s.length) {
        const c = s[i];
        if (c === ' ' || c === '\t') {
            i++;
            continue;
        }
        if (isDigit(c) || c === '.') {
            let num = '';
            while (i < s.length && (isDigit(s[i]) || s[i] === '.')) {
                num += s[i];
                i++;
            }
            tokens.push(num);
        } else if (c === '+' || c === '-' || c === '*' || c === '/' || c === '(' || c === ')') {
            // Handle unary + and - by checking context
            if (c === '+' || c === '-') {
                // It's unary if it's at the start or after an operator or opening paren
                if (tokens.length === 0 || isOperatorOrOpenParen(tokens[tokens.length - 1])) {
                    tokens.push(c);
                    i++;
                    continue;
                }
            }
            tokens.push(c);
            i++;
        } else {
            i++; // skip unknown chars
        }
    }
    return tokens;
}

function isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
}

function isOperatorOrOpenParen(token: string): boolean {
    return ['+', '-', '*', '/', '('].includes(token);
}

class Parser {
    private tokens: string[];
    private pos: number;

    constructor(tokens: string[]) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek(): string | undefined {
        return this.tokens[this.pos];
    }

    consume(): string {
        return this.tokens[this.pos++];
    }

    parseExpression(): number {
        return this.parseAddSub();
    }

    parseAddSub(): number {
        let left = this.parseMulDiv();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.parseMulDiv();
            if (op === '+') {
                left = left + right;
            } else {
                left = left - right;
            }
        }
        return left;
    }

    parseMulDiv(): number {
        let left = this.parseUnary();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseUnary();
            if (op === '*') {
                left = left * right;
            } else {
                // Truncate toward zero
                left = this.truncateDiv(left, right);
            }
        }
        return left;
    }

    parseUnary(): number {
        if (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const val = this.parseUnary();
            if (op === '-') {
                return -val;
            } else {
                return val;
            }
        }
        return this.parsePrimary();
    }

    parsePrimary(): number {
        const token = this.peek();
        if (!token) {
            throw new Error("Unexpected end of input");
        }

        if (token === '(') {
            this.consume(); // consume '('
            const val = this.parseExpression();
            const close = this.consume(); // consume ')'
            if (close !== ')') {
                throw new Error("Expected ')'");
            }
            return val;
        } else if (isDigit(token)) {
            this.consume();
            return parseInt(token, 10);
        } else {
            throw new Error(`Unexpected token: ${token}`);
        }
    }

    truncateDiv(a: number, b: number): number {
        if (b === 0) {
            throw new Error("Division by zero");
        }
        const res = a / b;
        if (res >= 0) {
            return Math.floor(res);
        } else {
            return Math.ceil(res);
        }
    }
}

const input = fs.readFileSync(0, "utf8");
try {
    const result = evaluateExpression(input);
    console.log(result);
} catch (e) {
    console.error(e);
    process.exit(1);
}
