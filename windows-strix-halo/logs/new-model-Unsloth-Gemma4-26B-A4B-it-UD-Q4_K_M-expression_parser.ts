import * as fs from 'fs';

class Parser {
    private tokens: string[];
    private pos: number = 0;

    constructor(tokens: string[]) {
        this.tokens = tokens;
    }

    private peek(): string | undefined {
        return this.tokens[this.pos];
    }

    private consume(): string {
        return this.tokens[this.pos++];
    }

    public parseExpression(): number {
        let node = this.parseTerm();
        while (this.peek() === "+" || this.peek() === "-") {
            const op = this.consume();
            const right = this.parseTerm();
            if (op === "+") {
                node += right;
            } else {
                node -= right;
            }
        }
        return node;
    }

    private parseTerm(): number {
        let node = this.parseFactor();
        while (this.peek() === "*" || this.peek() === "/") {
            const op = this.consume();
            const right = this.parseFactor();
            if (op === "*") {
                node *= right;
            } else {
                node = Math.trunc(node / right);
            }
        }
        return node;
    }

    private parseFactor(): number {
        const token = this.peek();
        if (token === "+") {
            this.consume();
            return this.parseFactor();
        } else if (token === "-") {
            this.consume();
            return -this.parseFactor();
        } else {
            return this.parsePrimary();
        }
    }

    private parsePrimary(): number {
        const token = this.consume();
        if (token === "(") {
            const val = this.parseExpression();
            this.consume(); // consume ')'
            return val;
        } else {
            return parseInt(token, 10);
        }
    }
}

function tokenize(input: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let num = "";
            while (i < input.length && /\d/.test(input[i])) {
                num += input[i];
                i++;
            }
            tokens.push(num);
            continue;
        }
        if ("+-*/()".includes(char)) {
            tokens.push(char);
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input || !input.trim()) return;
        const tokens = tokenize(input);
        if (tokens.length === 0) return;
        const parser = new Parser(tokens);
        const result = parser.parseExpression();
        process.stdout.write(result.toString() + "\n");
    } catch (e) {
        // Handle errors silently
    }
}

main();
