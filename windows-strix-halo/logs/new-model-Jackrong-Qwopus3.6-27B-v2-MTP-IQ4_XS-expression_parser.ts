import * as fs from 'fs';

class Parser {
    private tokens: string[];
    private pos: number;

    constructor(input: string) {
        this.tokens = [];
        this.pos = 0;
        this.tokenize(input);
    }

    private tokenize(input: string): void {
        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            if (ch === ' ') continue;
            if (ch >= '0' && ch <= '9') {
                let num = '';
                while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                    num += input[i];
                    i++;
                }
                this.tokens.push(num);
                i--; // will be incremented by the for loop
            } else {
                this.tokens.push(ch);
            }
        }
    }

    private peek(): string | undefined {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : undefined;
    }

    private consume(): string {
        return this.tokens[this.pos++];
    }

    private parseExpr(): number {
        let result = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const rhs = this.parseTerm();
            if (op === '+') {
                result += rhs;
            } else {
                result -= rhs;
            }
        }
        return result;
    }

    private parseTerm(): number {
        let result = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const rhs = this.parseFactor();
            if (op === '*') {
                result *= rhs;
            } else {
                // Division truncates toward zero
                result = Math.trunc(result / rhs);
            }
        }
        return result;
    }

    private parseFactor(): number {
        if (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const val = this.parseFactor();
            if (op === '+') {
                return val;
            } else {
                return -val;
            }
        }
        return this.parsePrimary();
    }

    private parsePrimary(): number {
        const tok = this.peek();
        if (tok === '(') {
            this.consume(); // consume '('
            const result = this.parseExpr();
            this.consume(); // consume ')'
            return result;
        }
        // It must be a number
        const num = this.consume();
        return parseInt(num, 10);
    }

    evaluate(): number {
        return this.parseExpr();
    }
}

const input = fs.readFileSync(0, 'utf8').trim();
const parser = new Parser(input);
console.log(parser.evaluate());
