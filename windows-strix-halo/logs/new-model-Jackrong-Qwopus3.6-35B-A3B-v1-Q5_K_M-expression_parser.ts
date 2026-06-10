import * as fs from "fs";

function evaluateExpression(expression: string): number {
    const tokens = tokenize(expression);
    const parser = new Parser(tokens);
    return parser.parse();
}

type Token = {
    type: "number" | "operator" | "lparen" | "rparen";
    value: string;
};

function tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];

        if (char === " ") {
            i++;
            continue;
        }

        if (char === "(") {
            tokens.push({ type: "lparen", value: char });
            i++;
            continue;
        }

        if (char === ")") {
            tokens.push({ type: "rparen", value: char });
            i++;
            continue;
        }

        if (char === "+" || char === "-" || char === "*" || char === "/") {
            tokens.push({ type: "operator", value: char });
            i++;
            continue;
        }

        // Number
        let numStr = "";
        while (i < expression.length && (expression[i] >= "0" && expression[i] <= "9")) {
            numStr += expression[i];
            i++;
        }
        if (numStr.length > 0) {
            tokens.push({ type: "number", value: numStr });
        }
    }
    return tokens;
}

class Parser {
    private tokens: Token[];
    private pos: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek(): Token | undefined {
        if (this.pos >= this.tokens.length) {
            return undefined;
        }
        return this.tokens[this.pos];
    }

    consume(): Token {
        const token = this.peek();
        if (token === undefined) {
            throw new Error("Unexpected end of input");
        }
        this.pos++;
        return token;
    }

    parse(): number {
        return this.parseExpression();
    }

    private parseExpression(): number {
        let left = this.parseTerm();

        while (true) {
            const token = this.peek();
            if (token && token.type === "operator" && (token.value === "+" || token.value === "-")) {
                this.consume();
                const right = this.parseTerm();
                if (token.value === "+") {
                    left = left + right;
                } else {
                    left = left - right;
                }
            } else {
                break;
            }
        }

        return left;
    }

    private parseTerm(): number {
        let left = this.parseUnary();

        while (true) {
            const token = this.peek();
            if (token && token.type === "operator" && (token.value === "*" || token.value === "/")) {
                this.consume();
                const right = this.parseUnary();
                if (token.value === "*") {
                    left = left * right;
                } else {
                    // Division truncates toward zero
                    left = left / right;
                    // Ensure truncation toward zero for negative results
                    if (left > 0) {
                        left = Math.floor(left);
                    } else {
                        left = Math.ceil(left);
                    }
                }
            } else {
                break;
            }
        }

        return left;
    }

    private parseUnary(): number {
        const token = this.peek();
        if (token && token.type === "operator" && (token.value === "+" || token.value === "-")) {
            this.consume();
            const operand = this.parseUnary();
            if (token.value === "-") {
                return -operand;
            }
            return operand;
        }
        return this.parsePrimary();
    }

    private parsePrimary(): number {
        const token = this.peek();
        if (token === undefined) {
            throw new Error("Unexpected end of input");
        }

        if (token.type === "number") {
            this.consume();
            return parseInt(token.value, 10);
        }

        if (token.type === "lparen") {
            this.consume();
            const result = this.parseExpression();
            const closing = this.consume();
            if (closing.type !== "rparen") {
                throw new Error("Expected ')'");
            }
            return result;
        }

        throw new Error(`Unexpected token: ${token.value}`);
    }
}

const input = fs.readFileSync(0, "utf8").trim();
const result = evaluateExpression(input);
console.log(result);
