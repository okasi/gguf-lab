import * as fs from 'fs';

/**
 * A simple recursive descent parser for arithmetic expressions.
 * Handles: 
 * - Addition (+), Subtraction (-)
 * - Multiplication (*), Division (/)
 * - Unary plus (+), Unary minus (-)
 * - Parentheses ()
 * - Integer literals
 * - Truncated division towards zero.
 */
class Evaluator {
    private tokens: string[];
    private pos: number = 0;

    constructor(input: string) {
        // Tokenize the input: matches integers, operators, and parentheses
        this.tokens = input.match(/\d+|[+\-*/()]/g) || [];
    }

    private peek(): string | undefined {
        return this.tokens[this.pos];
    }

    private consume(): string {
        return this.tokens[this.pos++];
    }

    public evaluate(): number {
        const result = this.parseExpression();
        return result;
    }

    // Grammar:
    // Expression -> Term { (+|-) Term }
    // Term       -> Factor { (*|/) Factor }
    // Factor     -> (+|-) Factor | (Expression) | Number
    
    private parseExpression(): number {
        let left = this.parseTerm();

        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.parseTerm();
            if (op === '+') left += right;
            else left -= right;
        }
        return left;
    }

    private parseTerm(): number {
        let left = this.parseFactor();

        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseFactor();
            if (op === '*') {
                left *= right;
            } else {
                // Truncate toward zero division
                left = Math.trunc(left / right);
            }
        }
        return left;
    }

    private parseFactor(): number {
        const token = this.peek();

        if (token === '+') {
            this.consume();
            return this.parseFactor();
        }

        if (token === '-') {
            this.consume();
            return -this.parseFactor();
        }

        if (token === '(') {
            this.consume(); // consume (
            const result = this.parseExpression();
            this.consume(); // consume )
            return result;
        }

        const val = parseInt(this.consume()!, 10);
        return val;
    }
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input) return;
        const evaluator = new Evaluator(input);
        console.log(evaluator.evaluate());
    } catch (e) {
        // Silent error handling for malformed input
    }
}

main();
