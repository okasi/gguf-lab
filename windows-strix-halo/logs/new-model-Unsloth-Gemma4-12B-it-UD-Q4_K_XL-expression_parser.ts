type TokenType = "NUMBER" | "PLUS" | "MINUS" | "MULTIPLY" | "DIVIDE" | "LPAREN" | "RPAREN" | "EOF";

    interface Token {
        type: TokenType;
        value: number | string;
    }

    class Lexer {
        private pos = 0;
        constructor(private input: string) {}

        tokenize(): Token[] {
            const tokens: Token[] = [];
            while (this.pos < this.input.length) {
                const char = this.input[this.pos];
                if (/\s/.test(char)) {
                    this.pos++;
                    continue;
                }
                if (/\d/.test(char)) {
                    let numStr = "";
                    while (this.pos < this.input.length && /[\d.]/.test(this.input[this.pos])) {
                        numStr += this.input[this.pos];
                        this.pos++;
                    }
                    // The problem says integers, so we don't need to worry about decimals,
                    // but let's keep it robust for integers.
                    tokens.push({ type: "NUMBER", value: parseInt(numStr, 10) });
                    continue;
                }
                if (char === '+') { tokens.push({ type: "PLUS", value: "+" }); this.pos++; continue; }
                if (char === '-') { tokens.push({ type: "MINUS", value: "-" }); this.pos++; continue; }
                if (char === '*') { tokens.push({ type: "MULTIPLY", value: "*" }); this.pos++; continue; }
                if (char === '/') { tokens.push({ type: "DIVIDE", value: "/" }); this.pos++; continue; }
                if (char === '(') { tokens.push({ type: "LPAREN", value: "(" }); this.pos++; continue; }
                if (char === ')') { tokens.push({ type: "RPAREN", value: ")" }); this.pos++; continue; }
                this.pos++; // Skip unknown
            }
            tokens.push({ type: "EOF", value: "" });
            return tokens;
        }
    }
