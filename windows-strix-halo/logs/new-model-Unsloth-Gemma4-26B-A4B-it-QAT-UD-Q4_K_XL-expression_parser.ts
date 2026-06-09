import * as fs from 'fs';

/**
 * Arithmetic Expression Evaluator
 * Implements a Recursive Descent Parser to handle precedence and parentheses.
 */

class Evaluator {
    private tokens: string[];
    private pos: number;

    constructor(input: string) {
        this.tokens = this.tokenize(input);
        this.pos = 0;
    }

    private tokenize(input: string): string[] {
        const regex = /\d+|[+\-*/()]/g;
        return input.match(regex) || [];
    }

    private peek(): string | undefined {
        return this.tokens[this.pos];
    }

    private consume(): string | undefined {
        return this.tokens[this.pos++];
    }

    public evaluate(): number {
        if (this.tokens.length === 0) return 0;
        const result = this.parseExpression();
        return result;
    }

    // Lowest precedence: Addition and Subtraction
    private parseExpression(): number {
        let node = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();!;
            const right = this.parseTerm();
            if (op === '+') node += right;
            else node -= right;
        }
        return node;
    }

    // Middle precedence: Multiplication and Division
    private parseTerm(): number {
        let node = this.parseUnary();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume()!;
            const right = this.parseUnary();
            if (op === '*') {
                node *= right;
            } else {
                // Truncate toward zero division
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }

    // Highest precedence: Unary +/-
    private parseUnary(): number {
        if (this.peek() === '+') {
            this.consume();
            return this.parseUnary();
        }
        if (this.peek() === '-') {
            this.consume();
            return -this.parseUnary();
        }
        return this.parsePrimary();
    }

    // Base case: Parentheses or Numbers
    private parsePrimary(): number {
        const token = this.consume();
        if (token === '(') {
            const result = this.parseExpression();
            this.consume(); // consume ')'
            return result;
        } else {
            return parseInt(token!, 10);
        }
    }
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input) return;
        const evaluator = new Evaluator(input);
        console.log(evaluator.evaluate());
    } catch (e) {
        // Silently handle or exit
        process.exit(0);
    }
}

main();
