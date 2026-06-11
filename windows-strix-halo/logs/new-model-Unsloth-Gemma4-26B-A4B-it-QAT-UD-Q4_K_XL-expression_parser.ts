import * as fs from 'fs';

/**
 * Implementation of a recursive descent parser to evaluate arithmetic expressions.
 * Handles: 
 * - Integer literals
 * - Binary operators: +, -, *, / (truncating division)
 * - Unary operators: +, -
 * - Parentheses: ( )
 */

class ExpressionParser {
    private tokens: string[];
    private pos: number = 0;

    constructor(input: string) {
        this.tokens = this.tokenize(input);
    }

    private tokenize(input: string): string[] {
        const tokens: string[] = [];
        // Match numbers, or single characters for operators and parentheses
        const regex = /\d+|[+\-*/()]/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            tokens.push(match[0]);
        }
        return tokens;
    }

    private peek(): string | null {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
    }

    private consume(): string | null {
        return this.peek() !== null ? this.tokens[this.pos++] : null;
    }

    // Grammar:
    // Expression -> Term (('+' | '-') Term)*
    // Term       -> Factor (('*' | '/') Factor)*
    // Factor     -> ('+' | '-') Factor | Primary
    // Primary    -> Number | '(' Expression ')'

    public evaluate(): number {
        return this.parseExpression();
    }

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

    private parseTerm(): number {
        let node = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume()!;
            const right = this.parseFactor();
            if (op === '*') {
                node *= right;
            } else {
                // Integer division truncating toward zero
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }

    private parseFactor(): number {
        const token = this.peek();
        if (token === '+') {
            this.consume();
            return this.parseFactor();
        } else if (token === '-') {
            this.consume();
            return -this.parseFactor();
        }
        return this.parsePrimary();
    }

    private parsePrimary(): number {
        const token = this.consume();
        if (token === '(') {
            const result = this.parseExpression();
            this.consume(); // consume ')'
            return result;
        } else if (token === undefined) {
            throw new Error("Unexpected end of input");
        } else {
            // It's a number
            return parseInt(token, 10);
        }
    }
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim()) return;
        const parser = new ExpressionParser(input);
        console.log(parser.evaluate());
    } catch (err) {
        process.exit(1);
    }
}

main();
