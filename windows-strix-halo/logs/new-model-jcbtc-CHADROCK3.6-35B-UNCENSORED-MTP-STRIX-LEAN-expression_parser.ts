import * as fs from 'fs';

function evaluateExpression(expr: string): number {
    const tokens: Token[] = tokenize(expr);
    const parser = new Parser(tokens);
    return parser.parse();
}

type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'LPAREN' | 'RPAREN';

interface Token {
    type: TokenType;
    value: number;
}

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (char === ' ') {
            i++;
            continue;
        }
        if (char >= '0' && char <= '9') {
            let numStr = '';
            while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
        } else if (char === '+') {
            tokens.push({ type: 'PLUS', value: 0 });
            i++;
        } else if (char === '-') {
            tokens.push({ type: 'MINUS', value: 0 });
            i++;
        } else if (char === '*') {
            tokens.push({ type: 'MULTIPLY', value: 0 });
            i++;
        } else if (char === '/') {
            tokens.push({ type: 'DIVIDE', value: 0 });
            i++;
        } else if (char === '(') {
            tokens.push({ type: 'LPAREN', value: 0 });
            i++;
        } else if (char === ')') {
            tokens.push({ type: 'RPAREN', value: 0 });
            i++;
        } else {
            throw new Error(`Unexpected character: ${char}`);
        }
    }
    return tokens;
}

class Parser {
    private pos: number = 0;
    private tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private consume(): Token {
        const token = this.tokens[this.pos];
        if (!token) {
            throw new Error('Unexpected end of input');
        }
        this.pos++;
        return token;
    }

    public parse(): number {
        const result = this.parseExpression();
        if (this.pos < this.tokens.length) {
            throw new Error('Unexpected token after expression');
        }
        return result;
    }

    // Lowest precedence: + and -
    private parseExpression(): number {
        let left = this.parseTerm();
        while (this.peek()?.type === 'PLUS' || this.peek()?.type === 'MINUS') {
            const op = this.consume();
            const right = this.parseTerm();
            if (op.type === 'PLUS') {
                left = left + right;
            } else {
                left = left - right;
            }
        }
        return left;
    }

    // Medium precedence: * and /
    private parseTerm(): number {
        let left = this.parseUnary();
        while (this.peek()?.type === 'MULTIPLY' || this.peek()?.type === 'DIVIDE') {
            const op = this.consume();
            const right = this.parseUnary();
            if (op.type === 'MULTIPLY') {
                left = left * right;
            } else {
                // Division truncates toward zero
                if (right === 0) {
                    throw new Error('Division by zero');
                }
                left = Math.trunc(left / right);
            }
        }
        return left;
    }

    // Highest precedence: unary +/- and primary expressions
    private parseUnary(): number {
        if (this.peek()?.type === 'PLUS' || this.peek()?.type === 'MINUS') {
            const op = this.consume();
            const value = this.parseUnary();
            if (op.type === 'MINUS') {
                return -value;
            } else {
                return value;
            }
        }
        return this.parsePrimary();
    }

    // Primary: numbers and parenthesized expressions
    private parsePrimary(): number {
        const token = this.peek();
        if (!token) {
            throw new Error('Unexpected end of input');
        }
        if (token.type === 'NUMBER') {
            this.consume();
            return token.value;
        } else if (token.type === 'LPAREN') {
            this.consume(); // consume '('
            const result = this.parseExpression();
            const close = this.consume();
            if (close.type !== 'RPAREN') {
                throw new Error('Expected closing parenthesis');
            }
            return result;
        } else {
            throw new Error(`Unexpected token: ${token.type}`);
        }
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const result = evaluateExpression(input);
console.log(result);
