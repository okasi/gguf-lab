import * as fs from 'fs';

class Parser {
    private tokens: string[];
    private pos: number = 0;

    constructor(input: string) {
        this.tokens = this.tokenize(input);
    }

    private tokenize(input: string): string[] {
        const tokens: string[] = [];
        let i = 0;
        while (i < input.length) {
            const char = input[i];
            if (/\s/.test(char)) {
                i++;
            } else if (/\d/.test(char)) {
                let num = "";
                while (i < input.length && /\d/.test(input[i])) {
                    num += input[i++];
                }
                tokens.push(num);
            } else if ("+-*/()".includes(char)) {
                tokens.push(char);
                i++;
            } else {
                i++;
            }
        }
        return tokens;
    }

    private peek() {
        return this.tokens[this.pos] || null;
    }

    private consume() {
        return this.tokens[this.pos++];
    }

    public parse(): number {
        return this.expression();
    }

    private expression(): number {
        let node = this.term();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.term();
            if (op === '+') node += right;
            else node -= right;
        }
        return node;
    }

    private term(): number {
        let node = this.unary();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.unary();
            if (op === '*') {
                node *= right;
            } else {
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }

    private unary(): number {
        if (this.peek() === '+') {
            this.consume();
            return this.unary();
        }
        if (this.peek() === '-') {
            this.consume();
            return -this.unary();
        }
        return this.primary();
    }

    private primary(): number {
        const token = this.consume();
        if (token === '(') {
            const result = this.expression();
            this.consume(); // consume ')'
            return result;
        }
        return parseInt(token, 10);
    }
}

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) return;
    const parser = new Parser(input);
    process.stdout.write(parser.parse().toString() + "\n");
}

main();
