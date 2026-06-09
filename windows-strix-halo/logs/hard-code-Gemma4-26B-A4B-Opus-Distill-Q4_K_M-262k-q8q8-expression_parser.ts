import * as fs from "fs";

enum TokenType {
    Number,
    Plus,
    Minus,
    Multiply,
    Divide,
    LParen,
    RParen,
    EOF
}

class Token {
    constructor(public type: TokenType, public value: number | null = null) {}
}

class Lexer {
    private pos = 0;
    private input: string;

    constructor(input: string) {
        this.input = input;
    }

    private peek() {
        return this.input[this.pos] || null;
    }

    private consume() {
        return this.input[this.pos++];
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        while (this.pos < this.input.length) {
            const char = this.peek();

            if (/\s/.test(char)) {
                this.consume();
                continue;
            }

            if (/\d/.test(char)) {
                let numStr = "";
                while (this.peek() !== null && /\d/.test(this.peek())) {
                    numStr += this.consume();
                }
                tokens.push(new Token(TokenType.Number, parseInt(numStr, 10)));
                continue;
            }

            switch (char) {
                case '+': tokens.push(new Token(TokenType.Plus)); break;
                case '-': tokens.push(new Token(TokenType.Minus)); break;
                case '*': tokens.push(new Token(TokenType.Multiply)); break;
                case '/': tokens.push(new Token(TokenType.Divide)); break;
                case '(': tokens.push(new Token(TokenType.LParen)); break;
                case ')': tokens.push(new Token(TokenType.RParen)); break;
                default:
                    throw new Error(`Unexpected character: ${char}`);
            }
            this.consume();
        }
        tokens.push(new Token(TokenType.EOF));
        return tokens;
    }
}

class Parser {
    private tokens: Token[];
    private pos = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek() {
        return this.tokens[this.pos];
    }

    private consume() {
        return this.tokens[this.pos++];
    }

    private expect(type: TokenType) {
        const token = this.peek();
        if (token.type !== type) {
            throw new Error(`Expected ${TokenType[type]} but got ${TokenType[token.type]}`);
        }
        return this.consume();
    }

    // Expression -> Term { ('+' | '-') Term }
    public parseExpression(): number {
        let node = this.parseTerm();

        while (this.peek().type === TokenType.Plus || this.peek().type === TokenType.Minus) {
            const op = this.consume().type;
            const right = this.parseTerm();
            if (op === TokenType.Plus) node += right;
            else node -= right;
        }
        return node;
    }

    // Term -> Unary { ('*' | '/') Unary }
    private parseTerm(): number {
        let node = this.parseUnary();

        while (this.peek().type === TokenType.Multiply || this.peek().type === TokenType.Divide) {
            const op = this.consume().type;
            const right = this.parseUnary();
            if (op === TokenType.Multiply) {
                node *= right;
            } else {
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }

    // Unary -> ('+' | '-') Unary | Primary
    private parseUnary(): number {
        if (this.peek().type === TokenType.Plus) {
            this.consume();
            return this.parseUnary();
        }
        if (this.peek().type === TokenType.Minus) {
            this.consume();
            return -this.parseUnary();
        }
        return this.parsePrimary();
    }

    // Primary -> Number | '(' Expression ')'
    private parsePrimary(): number {
        const token = this.peek();

        if (token.type === TokenType.Number) {
            this.consume();
            return token.value!;
        }

        if (token.type === TokenType.LParen) {
            this.consume();
            const result = this.parseExpression();
            this.expect(TokenType.RParen);
            return result;
        }

        throw new Error(`Unexpected token: ${TokenType[token.type]}`);
    }
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim()) return;

        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const result = parser.parseExpression();

        if (parser.peek().type !== TokenType.EOF) {
            throw new Error("Unexpected tokens after expression");
        }

        process.stdout.write(result.toString() + "\n");
    } catch (err: any) {
        process.exit(1);
    }
}

main();
