import * as fs from "fs";

// --- Token Definitions ---
type Token = {
    type: 'NUMBER' | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'LPAREN' | 'RPAREN';
    value: number | string;
};

// --- Lexer Implementation ---
class Lexer {
    private input: string;
    private pos: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    public nextToken(): Token | null {
        while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
            this.pos++; // Skip whitespace
        }

        if (this.pos >= this.input.length) {
            return null;
        }

        const char = this.input[this.pos];

        if (/[0-9]/.test(char)) {
            let numStr = '';
            while (this.pos < this.input.length && /[0-9]/.test(this.input[this.pos])) {
                numStr += this.input[this.pos];
                this.pos++;
            }
            return { type: 'NUMBER', value: parseInt(numStr, 10) };
        }

        this.pos++;
        switch (char) {
            case '+': return { type: 'PLUS', value: '+' };
            case '-': return { type: 'MINUS', value: '-' };
            case '*': return { type: 'STAR', value: '*' };
            case '/': return { type: 'SLASH', value: '/' };
            case '(': return { type: 'LPAREN', value: '(' };
            case ')': return { type: 'RPAREN', value: ')' };
            default: throw new Error(`Lexer error: Unknown character ${char}`);
        }
    }
}

// --- Parser Implementation ---

class Parser {
    private lexer: Lexer;
    private currentToken: Token | null = null;

    constructor(input: string) {
        this.lexer = new Lexer(input);
        this.nextToken(); // Load the first token
    }

    private nextToken(): void {
        this.currentToken = this.lexer.nextToken();
    }

    private consume(expectedType: Token['type'], errorMessage: string = ''): Token {
        if (!this.currentToken || this.currentToken.type !== expectedType) {
            throw new Error(errorMessage || `Syntax Error: Expected ${expectedType}, but got ${this.currentToken?.type}`);
        }
        const token = this.currentToken;
        this.nextToken(); // Advance to the next token
        return token;
    }

    // Handles numbers and unary signs (+/-)
    private parseFactor(): number {
        let sign = 1;
        
        // Check for unary plus or minus
        if (this.currentToken && (this.currentToken.type === 'PLUS' || this.currentToken.type === 'MINUS')) {
            const operator = this.currentToken.type;
            this.nextToken(); // Consume the sign
            if (operator === 'MINUS') {
                sign = -1;
            }
        }

        // The next token must be a number or an opening parenthesis
        if (!this.currentToken) {
            throw new Error("Syntax Error: Expected number or '('");
        }
        
        if (this.currentToken.type === 'NUMBER') {
            const num = this.currentToken.value;
            this.nextToken(); // Consume the number
            return num * sign;
        } else if (this.currentToken.type === 'LPAREN') {
            this.consume('LPAREN', "Syntax Error: Expected '('");
            const result = this.parseExpression();
            this.consume('RPAREN', "Syntax Error: Expected ')' after expression");
            return result * sign;
        } else {
            throw new Error(`Syntax Error: Expected number or '(' in factor, got ${this.currentToken.type}`);
        }
    }

    // Handles multiplication and division (Precedence level 2)
    private parseTerm(): number {
        let result = this.parseFactor();

        while (this.currentToken && (this.currentToken.type === 'STAR' || this.currentToken.type === 'SLASH')) {
            const operatorToken = this.currentToken;
            this.nextToken(); // Consume operator

            const right = this.parseFactor();

            if (operatorToken.type === 'STAR') {
                result *= right;
            } else { // SLASH
                // Division must truncate toward zero
                result = Math.trunc(result / right);
            }
        }
        return result;
    }

    // Handles addition and subtraction (Precedence level 1 - Lowest)
    private parseExpression(): number {
        let result = this.parseTerm();

        while (this.currentToken && (this.currentToken.type === 'PLUS' || this.currentToken.type === 'MINUS')) {
            const operatorToken = this.currentToken;
            this.nextToken(); // Consume operator

            const right = this.parseTerm();

            if (operatorToken.type === 'PLUS') {
                result += right;
            } else { // MINUS
                result -= right;
            }
        }
        return result;
    }

    public parse(): number {
        const result = this.parseExpression();
        
        // Ensure no tokens remain after parsing the main expression
        if (this.currentToken !== null) {
             throw new Error(`Syntax Error: Unexpected token remaining: ${this.currentToken.type}`);
        }
        return result;
    }
}


// --- Main Execution ---
function main() {
    try {
        // Read all input from standard input (file descriptor 0)
        const input = fs.readFileSync(0, "utf8").trim();

        if (input === "") {
            return;
        }

        const parser = new Parser(input);
        const result = parser.parse();
        console.log(result);

    } catch (e) {
        // In a production environment, we might handle this gracefully.
        // For this specific problem, we just let the error propagate if the input is invalid.
        // console.error(e.message);
    }
}

main();
