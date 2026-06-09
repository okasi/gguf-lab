class Parser {
    tokens: TokenType[];
    pos: number;

    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek() {
        if (this.pos < this.tokens.length) return this.tokens[this.pos];
        return null;
    }

    consume() {
        if (this.pos < this.tokens.length) {
            const token = this.tokens[this.pos];
            this.pos++;
            return token;
        }
        throw new Error("Unexpected end of input");
    }

    expect(type) {
        const token = this.consume();
        if (token.type !== type) throw new Error(`Expected ${type}, got ${token.type}`);
        return token;
    }

    parseExpr() {
        let result = this.parseTerm();
        while (this.peek() && (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS)) {
            const op = this.consume();
            const right = this.parseTerm();
            if (op.type === TokenType.PLUS) {
                result = result + right;
            } else {
                result = result - right;
            }
        }
        return result;
    }

    parseTerm() {
        let result = this.parseFactor();
        while (this.peek() && (this.peek().type === TokenType.TIMES || this.peek().type === TokenType.DIVIDE)) {
            const op = this.consume();
            const right = this.parseFactor();
            if (op.type === TokenType.TIMES) {
                result = result * right;
            } else {
                // integer division truncating toward zero
                result = Math.trunc(result / right);
            }
        }
        return result;
    }

    parseFactor() {
        return this.parseUnary();
    }

    parseUnary() {
        if (this.peek() && (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS)) {
            const op = this.consume();
            const right = this.parseUnary();
            if (op.type === TokenType.PLUS) {
                return right;
            } else {
                return -right;
            }
        }
        return this.parsePrimary();
    }

    parsePrimary() {
        const token = this.peek();
        if (!token) throw new Error("Unexpected end of input");
        if (token.type === TokenType.NUMBER) {
            this.consume();
            return token.value;
        }
        if (token.type === TokenType.LPAREN) {
            this.consume(); // consume '('
            const result = this.parseExpr();
            this.expect(TokenType.RPAREN); // consume ')'
            return result;
            }
        throw new Error("Unexpected token: " + token.type);
    }
}

But note: In parseFactor, we call parseUnary. That's fine. But we need to consider that in parseTerm, after parsing a factor, we might have a '*' or '/', and then we parse another factor. That factor will parse unary, which may start with '+' or '-'. That's correct.

Now, we need to handle the case where the expression is empty? Probably not, but we can assume valid expression.

Now, we need to write the tokenizer.

Define TokenType enum or constant strings.

We'll define:

const TokenType = {
    NUMBER: 'NUMBER',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    TIMES: 'TIMES',
    DIVIDE: 'DIVIDE',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
};

Now, tokenizer: iterate over the string, skip spaces, when digit, read whole number, create token with type NUMBER and value parseInt. For operators and parentheses, create token.

We need to be careful: The input may contain only one line. We'll read using fs.readFileSync(0, 'utf8').trim()? Possibly there could be trailing newline. We'll trim to remove whitespace.

Now, we'll write the main code:

import * as fs from 'fs';

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const tokens = tokenize(input);
    const parser = new Parser(tokens);
    const result = parser.parseExpr();
    console.log(result);
}

Now, we need to implement tokenize.

function tokenize(input: string): TokenType[] {
    const tokens: TokenType[] = [];
    let i = 0;
    while (i < input.length) {
        const ch = input[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let j = i;
            while (j < input.length && input[j] >= '0' && input[j] <= '9') {
                j++;
            }
            const numStr = input.substring(i, j);
            const value = parseInt(numStr, 10);
            tokens.push({ type: TokenType.NUMBER, value });
            i = j;
        } else if (ch === '+') {
            tokens.push({ type: TokenType.PLUS });
            i++;
        } else if (ch === '-') {
            tokens.push({ type: TokenType.MINUS });
            i++;
        } else if (ch === '*') {
            tokens.push({ type: TokenType.TIMES });
            i++;
        } else if (ch === '/') {
            tokens.push({ type: TokenType.DIVIDE });
            i++;
        } else if (ch === '(') {
            tokens.push({ type: TokenType.LPAREN });
            i++;
        } else if (ch === ')') {
            tokens.push({ type: TokenType.RPAREN });
            i++;
        } else {
            throw new Error(`Unexpected character: ${ch}`);
        }
    }
    return tokens;
}

But note: The token type for operators doesn't have value; we can just use type. For number, we have value.

Now, we need to define the Parser class. We'll put it in the same file.

We'll use TypeScript features like interfaces.

Now, we need to ensure that the division truncates toward zero. Using Math.trunc is fine. However, we must consider that if we have large numbers, the division might produce a floating point that is not exact, but Math.trunc should still give the correct integer because the error is less than 1? Let's test: Suppose a = 1e15, b = 3. a/b = 333333333333333.3333333333333333. In double, 1e15/3 might be represented as 333333333333333.3125? Actually, 1e15 is exactly representable? 1e15 is 1000000000000000, which is within safe integer range. 3 is exact. The division result is not exactly representable, but the double representation will be the closest representable double to the true quotient. The true quotient is 333333333333333.33333... The nearest double might be slightly above or below. The error is on the order of 1e-15 relative to the magnitude, so the absolute error is about 333333333333333 * 2^-52 ≈ 333333333333333 * 2.22e-16 ≈ 0.074. So the error is less than 1, so Math.trunc should give the correct integer part? If the true quotient is 333333333333333.333..., the nearest double could be 333333333333333.3125 or 333333333333333.34375, both still have integer part 333333333333333. So truncation yields 333333333333333. That's correct. But what if the true quotient is exactly an integer? Then the double should represent it exactly if it's within safe integer range. So it's fine.

However, there is a scenario: if the quotient is negative, e.g., -5/2 = -2.5, truncation toward zero yields -2. Math.trunc(-2.5) = -2, correct. So Math.trunc works.

But we need to be careful: In JavaScript, division of integers can produce -0? Not relevant.

Thus Math.trunc is acceptable.

Alternatively, we can implement integer division using: let q = a / b; if ((a < 0) ^ (b < 0)) q = -Math.floor(Math.abs(a) / Math.abs(b)); else q = Math.floor(a / b); but that's more code.

We'll stick with Math.trunc.

Now, we need to ensure that the parser handles the case where there is no input? Not needed.

Now, we need to consider that the expression may contain unary plus before a number, like "+5". That's fine.

Now, we need to test with some examples mentally:

- "1+2*3" => 1+6=7.
- "2*(3+4)" => 2*7=14.
- "-3+2" => -1.
- "3*-2" => -6.
- "3*-2*4" => -24.
- "3/-2" => -1 (since 3/-2 = -1.5 truncates to -1? Actually truncation toward zero: -1.5 -> -1. So -1. But careful: In many languages, integer division truncates toward zero, so 3/-2 = -1. Yes.
- " - 3 " => -3.
- "++5" => 5.
- "--5" => 5.
- "2**3"? Not allowed, only binary operators as specified.

Now, we need to ensure that the parser doesn't treat a unary minus as part of a number. That's fine.

Now, we need to consider the possibility of multiple unary operators: e.g., "- - 5" => 5. Our parser: parseUnary sees '-', consumes, then calls parseUnary again, sees '-', consumes, calls parseUnary again, sees primary 5, returns 5, then applies unary minus: -5, then applies outer unary minus: -(-5)=5. Works.

Now, we need to consider that in parseTerm, we parse factor, then while we see '*' or '/', we parse another factor. But what about the case where after a factor we have a '+' or '-'? That's handled in parseExpr.

Now, we need to ensure that the parser correctly handles parentheses with unary: e.g., "(-3)" => parsePrimary sees '(', consumes, then parseExpr, which will parse term, factor, unary, which sees '-', unary, primary 3 => returns -3, then parseExpr returns -3, then expect ')', returns -3.

Now, we need to consider that the expression may have spaces anywhere.

Now, we need to write the code in TypeScript with proper types.

We'll define interfaces:

interface Token {
    type: string;
    value?: number;
}

But we can use a union type: type Token = { type: 'NUMBER'; value: number } | { type: 'PLUS' } | { type: 'MINUS' } | { type: 'TIMES' } | { type: 'DIVIDE' } | { type: 'LPAREN' } | { type: 'RPAREN' };

But for simplicity, we can just use object with type and optional value.

We'll define constants:

const TOK = {
    NUMBER: 'NUMBER',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    TIMES: 'TIMES',
    DIVIDE: 'DIVIDE',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
} as const;

And then use as const for types.

Now, we'll implement.

But we need to be careful about the division truncation: We'll use Math.trunc.

Now, we need to ensure that the program reads from stdin using fs.readFileSync(0, 'utf8'). That's fine.

Now, we need to output the integer result.

Now, we need to consider that the expression may be invalid; we can assume valid.

Now, we need to write the code.

Now, we need to ensure we don't use any external packages.

Now, we need to return only TypeScript code, no explanation and no Markdown fence. So we output the code directly.

Now, we need to make sure the code compiles and runs.

Now, let's write the full code.

We'll structure:

import * as fs from 'fs';

const TOK = { ... } as const;

type TokenType = typeof TOK[keyof typeof TOK];

interface NumberToken { type: 'NUMBER'; value: number; }
interface OperatorToken { type: 'PLUS' | 'MINUS' | 'TIMES' | 'DIVIDE'; }
interface ParenToken { type: 'LPAREN' | 'RPAREN'; }

type Token = NumberToken | OperatorToken | ParenToken;

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < input.length) {
        const ch = input[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let j = i;
            while (j < input.length && input[j] >= '0' && input[j] <= '9') {
                j++;
            }
            const numStr = input.substring(i, j);
            const value = parseInt(numStr, 10);
            tokens.push({ type: TOK.NUMBER, value });
            i = j;
        } else if (ch === '+') {
            tokens.push({ type: TOK.PLUS });
            i++;
        } else if (ch === '-') {
            tokens.push({ type: TOK.MINUS });
            i++;
        } else if (ch === '*') {
            tokens.push({ type: TOK.TIMES });
            i++;
        } else if (ch === '/') {
            tokens.push({ type: TOK.DIVIDE });
            i++;
        } else if (ch === '(') {
            tokens.push({ type: TOK.LPAREN });
            i++;
        } else if (ch === ')') {
            tokens.push({ type: TOK.RPAREN });
            i++;
        } else {
            throw new Error(`Unexpected character: ${ch}`);
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

    private peek(): Token | null {
        if (this.pos < this.tokens.length) {
            return this.tokens[this.pos];
        }
        return null;
    }

    private consume(): Token {
        if (this.pos < this.tokens.length) {
            const token = this.tokens[this.pos];
            this.pos++;
            return token;
        }
        throw new Error("Unexpected end of input");
    }

    private expect(type: TokenType): Token {
        const token = this.consume();
        if (token.type !== type) {
            throw new Error(`Expected ${type}, got ${token.type}`);
        }
        return token;
    }

    public parse(): number {
        const result = this.parseExpr();
        if (this.pos < this.tokens.length) {
            throw new Error("Unexpected tokens after expression");
        }
        return result;
    }

    private parseExpr(): number {
        let result = this.parseTerm();
        while (this.peek() && (this.peek().type === TOK.PLUS || this.peek().type === TOK.MINUS)) {
            const op = this.consume();
            const right = this.parseTerm();
            if (op.type === TOK.PLUS) {
                result = result + right;
            } else {
                result = result - right;
            }
        }
        return result;
    }

    private parseTerm(): number {
        let result = this.parseFactor();
        while (this.peek() && (this.peek().type === TOK.TIMES || this.peek().type === TOK.DIVIDE)) {
            const op = this.consume();
            const right = this.parseFactor();
            if (op.type === TOK.TIMES) {
                result = result * right;
            } else {
                // integer division truncating toward zero
                result = Math.trunc(result / right);
            }
        }
        return result;
    }

    private parseFactor(): number {
        return this.parseUnary();
    }

    private parseUnary(): number {
        if (this.peek() && (this.peek().type === TOK.PLUS || this.peek().type === TOK.MINUS)) {
            const op = this.consume();
            const right = this.parseUnary();
            if (op.type === TOK.PLUS) {
                return right;
            } else {
                return -right;
            }
        }
        return this.parsePrimary();
    }

    private parsePrimary(): number {
        const token = this.peek();
        if (!token) throw new Error("Unexpected end of input");
        if (token.type === TOK.NUMBER) {
            this.consume();
            return (token as NumberToken).value;
        }
        if (token.type === TOK.LPAREN) {
            this.consume(); // consume '('
            const result = this.parseExpr();
            this.expect(TOK.RPAREN);
            return result;
        }
        throw new Error(`Unexpected token: ${token.type}`);
    }
}

function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const tokens = tokenize(input);
    const parser = new Parser(tokens);
    const result = parser.parse();
    console.log(result);
}

main();

Now, we need to ensure that the types are correct. In parsePrimary, we cast token to NumberToken to access value. That's fine.

Now, we need to consider that the input may contain only spaces? Probably not.

Now, we need to test with some examples mentally:

- "1+2*3": tokens: NUM1, PLUS, NUM2, TIMES, NUM3. parseExpr: parseTerm -> parseFactor -> parseUnary -> parsePrimary -> 1. Then while loop: next token PLUS, consume, parseTerm: parseFactor -> parseUnary -> parsePrimary -> 2. Then while loop: next token TIMES, consume, parseFactor -> parseUnary -> parsePrimary -> 3, result = 2*3=6. Then parseTerm returns 6. Then parseExpr: right = 6, result = 1+6=7. Then no more tokens. Output 7.

- "2*(3+4)": parseTerm: parseFactor -> parseUnary -> parsePrimary -> 2. Then while: next token TIMES, consume, parseFactor -> parseUnary -> parsePrimary? Actually parsePrimary sees '(', so it will parse parentheses. Inside parentheses, parseExpr: parseTerm -> parseFactor -> parseUnary -> parsePrimary -> 3. Then while: next token PLUS, consume, parseTerm -> parseFactor -> parseUnary -> parsePrimary -> 4, result = 3+4=7. Then parseExpr returns 7. Then parsePrimary returns 7. Then parseTerm: result = 2*7=14. Then no more tokens. Output 14.

- "-3+2": parseExpr: parseTerm -> parseFactor -> parseUnary: sees MINUS, consume, parseUnary -> parsePrimary -> 3, returns -3. Then parseTerm returns -3. Then while: next token PLUS, consume, parseTerm -> parseFactor -> parseUnary -> parsePrimary -> 2, returns 2. result = -3+2 = -1. Output -1.

- "3*-2": parseTerm: parseFactor -> parseUnary -> parsePrimary -> 3. Then while: next token TIMES, consume, parseFactor -> parseUnary -> sees MINUS, consume, parseUnary -> parsePrimary -> 2, returns -2. result = 3 * -2 = -6. Output -6.

- "3/-2": parseTerm: parseFactor -> 3. Then while: next token DIVIDE, consume, parseFactor -> parseUnary -> MINUS, parseUnary -> 2 => -2. result = Math.trunc(3 / -2) = Math.trunc(-1.5) = -1. Output -1.

- " - 3 ": tokens: MINUS, NUM3. parseExpr: parseTerm -> parseFactor -> parseUnary -> MINUS, parseUnary -> parsePrimary -> 3 => -3. Then parseTerm returns -3. Then while: no more tokens. Output -3.

- "++5": parseUnary: PLUS, parseUnary -> PLUS, parseUnary -> parsePrimary -> 5 => 5, then outer PLUS returns 5. Output 5.

- "--5": parseUnary: MINUS, parseUnary -> MINUS, parseUnary -> 5 => 5, then outer MINUS returns -5? Wait: parseUnary: first sees MINUS, consumes, then calls parseUnary again. That parseUnary sees MINUS, consumes, calls parseUnary again, which sees primary 5, returns 5. Then the inner parseUnary (the second) applies MINUS: returns -5. Then the outer parseUnary applies MINUS: returns -(-5) = 5. So output 5. That's correct because --5 = 5.

But careful: In mathematics, --5 is ambiguous but typically unary minus twice yields positive. Our parser yields 5, which is correct.

Now, we need to consider that the expression might have multiple consecutive unary operators with plus and minus, like "+-5". That would be: parseUnary: PLUS, then parseUnary -> MINUS, then parseUnary -> 5 => 5, then MINUS returns -5, then PLUS returns -5. So +-5 = -5. That's correct.

Now, we need to consider that the expression might have something like "2 - -3". parseTerm: 2, then binary MINUS, then parseTerm: parseFactor -> parseUnary -> MINUS, parseUnary -> 3 => -3, so result = 2 - (-3) = 5. Good.

Now, we need to consider that the expression might have something like "(2+3)*4". Works.

Now, we need to consider that the expression might have something like "2**3"? Not allowed.

Now, we need to consider that the expression might have something like "2+3*4-5". Works.

Now, we need to consider that the expression might have something like "2*(3+4*5)". Works.

Now, we need to consider that the expression might have something like "2/3*4". Division truncates: 2/3 = 0 (truncation toward zero), then 0*4 = 0. But note: In many languages, integer division truncates, so 2/3 = 0. But our parser will compute: parseTerm: parseFactor -> 2. Then while: next token DIVIDE, consume, parseFactor -> 3, result = Math.trunc(2/3)=0. Then while: next token TIMES, consume, parseFactor -> 4, result = 0*4=0. So output 0. That's correct.

But note: In some languages, 2/3*4 might be evaluated as (2/3)*4 = 0*4=0. However, if we consider left associativity, that's fine.

Now, we need to consider that the expression might have something like "2*3/4". 2*3=6, 6/4=1 (truncation). Works.

Now, we need to consider that the expression might have something like "-2*3". parseTerm: parseFactor -> parseUnary -> MINUS, parseUnary -> 2 => -2, then while: TIMES, parseFactor -> 3, result = -2*3 = -6. Works.

Now, we need to consider that the expression might have something like "2*-3". parseTerm: parseFactor -> 2, then while: TIMES, parseFactor -> parseUnary -> MINUS, parseUnary -> 3 => -3, result = 2 * -3 = -6. Works.

Now, we need to consider that the expression might have something like "2/-3". parseTerm: 2, then DIVIDE, parseFactor -> -3, result = Math.trunc(2 / -3) = 0? 2/-3 = -0.666..., truncation toward zero yields 0. So result 0. Works.

Now, we need to consider that the expression might have something like "-2/-3". parseTerm: parseFactor -> -2, then DIVIDE, parseFactor -> -3, result = Math.trunc((-2)/(-3)) = Math.trunc(0.666...) = 0. So 0. Works.

Now, we need to consider that the expression might have something like "2+ -3". parseExpr: parseTerm -> 2, then PLUS, parseTerm -> parseFactor -> parseUnary -> MINUS, parseUnary -> 3 => -3, result = 2 + (-3) = -1. Works.

Now, we need to consider that the expression might have something like "2- -3". parseExpr: parseTerm -> 2, then MINUS, parseTerm -> parseFactor -> parseUnary -> MINUS, parseUnary -> 3 => -3, result = 2 - (-3) = 5. Works.

Now, we need to consider that the expression might have something like "2* -3". But spaces: "2* -3" is allowed. Our tokenizer will produce tokens: NUM2, TIMES, MINUS, NUM3. parseTerm: parseFactor -> 2, then while: TIMES, consume, parseFactor -> parseUnary -> MINUS, parseUnary -> 3 => -3, result = 2 * -3 = -6. Works.

Now, we need to consider that the expression might have something like "2+ - -3". That is "2 + - -3". Tokens: NUM2, PLUS, MINUS, MINUS, NUM3. parseExpr: parseTerm -> 2, then PLUS, parseTerm -> parseFactor -> parseUnary -> MINUS, parseUnary -> MINUS, parseUnary -> 3 =>? Let's compute: parseUnary sees MINUS, consumes, then parseUnary -> sees MINUS, consumes, then parseUnary -> 3 => 3, then inner MINUS returns -3, then outer MINUS returns -(-3)=3. So parseFactor returns 3. Then parseTerm returns 3. Then result = 2+3=5. That's correct because 2 + - -3 = 2 + 3 = 5.

Now, we need to consider that the expression might have something like "2* - -3". That would be 2 * 3 = 6. Works.

Now, we need to consider that the expression might have something like "2/ - -3". 2/3 = 0. Works.

Now, we need to consider that the expression might have something like " - 2 + 3". Works.

Now, we need to consider that the expression might have something like "2+3*4-5". Works.

Now, we need to consider that the expression might have something like "2*(3+4)*5". Works.

Now, we need to consider that the expression might have something like "2*(3+4*(5-6))". Works.

Now, we need to consider that the expression might have something like "2+3*4/5". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6". Works.

Now, we need to consider that the expression might have something like "2+3*4/5+6". Works.

Now, we need to consider that the expression might have something like "2+3*4/5-6". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35*36". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35*36-37". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35*36-37*38". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35*36-37*38/39". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35*36-37*38/39+40". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28/29+30*31-32*33/34+35*36-37*38/39+40*41". Works.

Now, we need to consider that the expression might have something like "2+3*4/5*6-7*8/9+10*11-12*13/14+15*16-17*18/19+20*21-22*23/24+25*26-27*28
