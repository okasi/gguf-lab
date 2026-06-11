import * as fs from "fs";

function evaluateExpression(expression: string): number {
    const chars = expression.replace(/\s+/g, "").split("");
    let pos = 0;

    function peek(): string | undefined {
        return chars[pos];
    }

    function consume(): string {
        return chars[pos++];
    }

    function parseUnary(): number {
        if (peek() === "+") {
            consume();
            return parseUnary();
        }
        if (peek() === "-") {
            consume();
            return -parseUnary();
        }
        return parseFactor();
    }

    function parseFactor(): number {
        if (peek() === "(") {
            consume(); // consume '('
            const result = parseExpression();
            consume(); // consume ')'
            return result;
        }

        // Parse integer
        let numStr = "";
        while (pos < chars.length && /\d/.test(chars[pos])) {
            numStr += consume();
        }
        return parseInt(numStr, 10);
    }

    function parseTerm(): number {
        let left = parseUnary();
        while (peek() === "*" || peek() === "/") {
            const op = consume();
            const right = parseUnary();
            if (op === "*") {
                left = left * right;
            } else {
                // Division truncates toward zero
                left = Math.trunc(left / right);
            }
        }
        return left;
    }

    function parseExpression(): number {
        let left = parseTerm();
        while (peek() === "+" || peek() === "-") {
            const op = consume();
            const right = parseTerm();
            if (op === "+") {
                left = left + right;
            } else {
                left = left - right;
            }
        }
        return left;
    }

    return parseExpression();
}

const input = fs.readFileSync(0, "utf8");
const expression = input.trim();
console.log(evaluateExpression(expression));
