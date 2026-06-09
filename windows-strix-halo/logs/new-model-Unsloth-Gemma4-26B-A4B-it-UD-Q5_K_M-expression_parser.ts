import * as fs from 'fs';

enum TokenType {
    Number,
    Plus,
    Minus,
    Mul,
    Div,
    LParen,
    RParen
}

interface Token {
    type: TokenType;
    value: number | string;
}

function tokenize(str: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let numStr = "";
            while (i < str.length && /[0-9]/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            tokens.push({ type: TokenType.Number, value: parseInt(numStr, 10) });
            continue;
        }
        if (char === '+') { tokens.push({ type: TokenType.Plus, value: '+' }); i++; }
        else if (char === '-') { tokens.push({ type: TokenType.Minus, value: '-' }); i++; }
        else if (char === '*') { tokens.push({ type: TokenType.Mul, value: '*' }); i++; }
        else if (char === '/') { tokens.push({ type: TokenType.Div, value: '/' }); i++; }
        else if (char === '(') { tokens.push({ type: TokenType.LParen, value: '(' }); i++; }
        else if (char === ')') { tokens.push({ type: TokenType.RParen, value: ')' }); i++; }
        else { i++; }
    }
    return tokens;
}

class Parser {
    private tokens: Token[];
    private pos: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private consume(): Token {
        return this.tokens[this.pos++];
    }

    public parse(): number {
        return this.parseExpression();
    }

    private parseExpression(): number {
        let node = this.parseTerm();
        while (this.peek() && (this.peek()!.type === TokenType.Plus || this.peek()!.type === TokenType.Minus)) {
            const op = this.consume().type;
            const right = this.parseTerm();
            if (op === TokenType.Plus) node += right;
            else node -= right;
        }
        return node;
    }

    private parseTerm(): number {
        let node = this.parseUnary();
        while (this.peek() && (this.peek()!.type === TokenType.Mul || this.peek()!.type === TokenType.Div)) {
            const op = this.consume().type;
            const right = this.parseUnary();
            if (op === TokenType.Mul) node *= right;
            else node = Math.trunc(node / right);
        }
        return node;
    }

    private parseUnary(): number {
        if (this.peek() && (this.peek()!.type === TokenType.Plus || this.peek()!.type === TokenType.Minus)) {
            const op = this.consume().type;
            const val = this.parseUnary();
            return op === TokenType.Plus ? val : -val;
        }
        return this.parsePrimary();
    }

    private parsePrimary(): number {
        const token = this.consume();
        if (!token) throw new Error("Unexpected end of expression");
        if (token.type === TokenType.Number) return token.value as number;
        if (token.type === TokenType.LParen) {
            const val = this.parseExpression();
            const next = this.consume();
            if (!next || next.type !== TokenType.RParen) throw new Error("Expected )");
            return val;
        }
        throw new Error("Unexpected token");
    }
}

function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim()) return;
        const tokens = tokenize(input);
        const parser = new Parser(tokens);
        process.stdout.write(parser.parse().toString() + "\n");
    } catch (e) {
        // Error handling is minimal to ensure only result is output
    }
}

main();
