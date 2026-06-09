import fs from 'fs';

function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        console.log(0);
        return;
    }
    const result = evaluate(input);
    console.log(result);
}

function evaluate(expr: string): number {
    let pos = 0;

    function peek(): string | undefined {
        return pos < expr.length ? expr[pos] : undefined;
    }

    function consume(): string {
        return expr[pos++];
    }

    function skipSpaces(): void {
        while (pos < expr.length && expr[pos] === ' ') {
            pos++;
        }
    }

    // Grammar:
    // expr   -> term (('+' | '-') term)*
    // term   -> unary (('*' | '/') unary)*
    // unary  -> ('+' | '-') unary | primary
    // primary-> NUMBER | '(' expr ')'

    function parseExpr(): number {
        let result = parseTerm();
        while (true) {
            skipSpaces();
            const ch = peek();
            if (ch === '+') {
                consume();
                const right = parseTerm();
                result = result + right;
            } else if (ch === '-') {
                consume();
                const right = parseTerm();
                result = result - right;
            } else {
                break;
            }
        }
        return result;
    }

    function parseTerm(): number {
        let result = parseUnary();
        while (true) {
            skipSpaces();
            const ch = peek();
            if (ch === '*') {
                consume();
                const right = parseUnary();
                result = result * right;
            } else if (ch === '/') {
                consume();
                const right = parseUnary();
                if (right === 0) {
                    throw new Error("Division by zero");
                }
                // Truncate toward zero
                result = Math.trunc(result / right);
            } else {
                break;
            }
        }
        return result;
    }

    function parseUnary(): number {
        skipSpaces();
        const ch = peek();
        if (ch === '+') {
            consume();
            return parseUnary();
        } else if (ch === '-') {
            consume();
            return -parseUnary();
        } else {
            return parsePrimary();
        }
    }

    function parsePrimary(): number {
        skipSpaces();
        const ch = peek();
        if (ch === '(') {
            consume(); // consume '('
            const result = parseExpr();
            skipSpaces();
            if (peek() !== ')') {
                throw new Error("Mismatched parentheses");
            }
            consume(); // consume ')'
            return result;
        } else {
            return parseNumber();
        }
    }

    function parseNumber(): number {
        skipSpaces();
        const start = pos;
        let hasDigit = false;
        while (pos < expr.length) {
            const ch = expr[pos];
            if (ch >= '0' && ch <= '9') {
                hasDigit = true;
                pos++;
            } else {
                break;
            }
        }
        if (!hasDigit) {
            throw new Error("Expected number");
        }
        return parseInt(expr.substring(start, pos), 10);
    }

    const result = parseExpr();
    skipSpaces();
    if (pos !== expr.length) {
        throw new Error("Unexpected characters at end of expression");
    }
    return result;
}

main();
