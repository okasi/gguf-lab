import * as fs from 'fs';

type TokenType = 'NUM' | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'LPAREN' | 'RPAREN' | 'EOF';

type Token = { type: TokenType; value?: number };

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = input.length;

    while (i < len) {
        const c = input[i];
        if (c === ' ') {
            i++;
            continue;
        }
        if (c === '+') {
            tokens.push({ type: 'PLUS' });
            i++;
        } else if (c === '-') {
            tokens.push({ type: 'MINUS' });
            i++;
        } else if (c === '*') {
            tokens.push({ type: 'STAR' });
            i++;
        } else if (c === '/') {
            tokens.push({ type: 'SLASH' });
            i++;
        } else if (c === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
        } else if (c === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
        } else if (/\d/.test(c)) {
            let j = i;
            while (j < len && /\d/.test(input[j])) {
                j++;
            }
            tokens.push({ type: 'NUM', value: parseInt(input.slice(i, j), 10) });
            i = j;
        } else {
            throw new Error(`Unexpected character: ${c}`);
        }
    }
    tokens.push({ type: 'EOF' });
    return tokens;
}

class Parser {
    private tokens: Token[];
    private pos: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.pos = 0;
    }

    private peek(): Token {
        return this.tokens[this.pos];
    }

    private consume(): Token {
        const token = this.tokens[this.pos];
        this.pos++;
        return token;
    }

    private expect(expectedType: TokenType): void {
        const token = this.consume();
        if (token.type !== expectedType) {
            throw new Error(`Expected ${expectedType}, got ${token.type}`);
        }
    }

    private evaluate(left: number, op: TokenType, right: number): number {
        switch (op) {
            case 'PLUS': return left + right;
            case 'MINUS': return left - right;
            case 'STAR': return left * right;
            case 'SLASH': return Math.trunc(left / right);
            default: throw new Error(`Unknown operator: ${op}`);
        }
    }

    public parse(): number {
        return this.parseExpression();
    }

    private parseExpression(): number {
        let left = this.parseTerm();

        while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
            const op = this.consume();
            const right = this.parseTerm();
            left = this.evaluate(left, op.type, right);
        }

        return left;
    }

    private parseTerm(): number {
        let left = this.parseUnary();

        while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
            const op = this.consume();
            const right = this.parseUnary();
            left = this.evaluate(left, op.type, right);
        }

        return left;
    }

    private parseUnary(): number {
        const token = this.peek();
        if (token.type === 'PLUS') {
            this.consume();
            return this.parseUnary();
        }
        if (token.type === 'MINUS') {
            this.consume();
            return -this.parseUnary();
        }
        return this.parseAtom();
    }

    private parseAtom(): number {
        const token = this.peek();
        if (token.type === 'LPAREN') {
            this.consume();
            const result = this.parseExpression();
            this.expect('RPAREN');
            return result;
        }
        if (token.type === 'NUM') {
            this.consume();
            return token.value!;
        }
        throw new Error(`Unexpected token: ${token.type}`);
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
if (input.length === 0) {
    throw new Error('Empty input');
}
const tokens = tokenize(input);
const parser = new Parser(tokens);
console.log(parser.parse());
