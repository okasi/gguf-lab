import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();

class Parser {
    private s: string;
    private pos: number;

    constructor(s: string) {
        this.s = s;
        this.pos = 0;
    }

    private skipSpaces(): void {
        while (this.pos < this.s.length && /\s/.test(this.s[this.pos])) {
            this.pos++;
        }
    }

    private peek(): string {
        this.skipSpaces();
        if (this.pos < this.s.length) {
            return this.s[this.pos];
        }
        return '';
    }

    private consume(expected?: string): string {
        this.skipSpaces();
        const ch = this.s[this.pos];
        if (expected !== undefined && ch !== expected) {
            throw new Error(`Expected ${expected} but got ${ch}`);
        }
        this.pos++;
        return ch;
    }

    private parseNumber(): number {
        this.skipSpaces();
        let numStr = '';
        while (this.pos < this.s.length && /\d/.test(this.s[this.pos])) {
            numStr += this.s[this.pos];
            this.pos++;
        }
        return parseInt(numStr, 10);
    }

    public parse(): number {
        const result = this.parseExpression();
        this.skipSpaces();
        if (this.pos < this.s.length) {
            throw new Error(`Unexpected character at position ${this.pos}: ${this.s[this.pos]}`);
        }
        return result;
    }

    private parseExpression(): number {
        let left = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.parseTerm();
            if (op === '+') {
                left = left + right;
            } else {
                left = left - right;
            }
        }
        return left;
    }

    private parseTerm(): number {
        let left = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseFactor();
            if (op === '*') {
                left = left * right;
            } else {
                left = Math.trunc(left / right);
            }
        }
        return left;
    }

    private parseFactor(): number {
        // Unary +/-
        if (this.peek() === '+' || this.peek() === '-') {
            const sign = this.peek() === '+' ? 1 : -1;
            this.consume();
            return sign * this.parseFactor();
        }
        // Parenthesized expression
        if (this.peek() === '(') {
            this.consume('(');
            const val = this.parseExpression();
            this.consume(')');
            return val;
        }
        // Number
        return this.parseNumber();
    }
}

const parser = new Parser(input);
const result = parser.parse();
console.log(result);

That should work.

But we need to be careful: In parseFactor, after consuming a unary sign, we call parseFactor again. That's correct. However, note that if there is a unary sign followed by a parenthesized expression, it will work: e.g., "-(1+2)" => parseFactor sees '-', consumes, then parseFactor again sees '(' and processes the expression. Good.

Now, we should test with some tricky cases:

- "1+2*3+4*5+6" => 1 + (2*3=6) + (4*5=20) + 6 = 33? Actually 1+6+20+6=33.

- "10 / 3" => 3 (trunc toward zero: 10/3=3.333 => 3).

- "-10 / 3" => -3 (since -10/3 = -3.333 => -3).

- "10 / -3" => -3.

- "-10 / -3" => 3.

- "0 / 5" => 0.

- "5 / 0"? Division by zero? Not specified, but probably not present. We can ignore.

Now, what about unary plus on a parenthesized expression: "+(5)" => 5.

Now, we need to ensure that the parser doesn't treat a unary plus as something else.

Now, consider expression like "1 + 2 * 3 - 4 / 5". Should be 1+6-0 = 7? Actually 4/5=0, so 1+6-0=7.

Now, we need to consider that the parser uses recursion for factor with unary signs. That's fine.

Now, check for any potential stack overflow due to deep nesting? The problem says parentheses may be nested deeply. Recursion might cause stack overflow if depth is huge, but typical recursion depth in Node.js is about 10000? It might be okay. But we could also implement an iterative shunting-yard to avoid recursion depth issues. However, the problem doesn't specify extreme depth; it says "may be nested deeply", but likely not beyond thousands. However, to be safe, we could implement shunting-yard. But recursive descent is simpler and likely acceptable. I'll stick with recursive descent.

But note: In parseFactor, we recursively call parseFactor for each unary sign. That could also cause deep recursion if there are many unary signs. But again, probably not huge.

We could implement an iterative approach: while peek is '+' or '-', accumulate sign, then after consuming signs, parse the operand. That would avoid recursion. Let's do that to be safer.

We can modify parseFactor to handle multiple unary signs iteratively:

private parseFactor(): number {
    let sign = 1;
    while (this.peek() === '+' || this.peek() === '-') {
        if (this.peek() === '-') sign = -sign;
        this.consume();
    }
    // Now parse the operand (number or parenthesized expression)
    let value: number;
    if (this.peek() === '(') {
        this.consume('(');
        value = this.parseExpression();
        this.consume(')');
    } else {
        value = this.parseNumber();
    }
    return sign * value;
}

That's better because it avoids recursion for unary signs. Also, it simplifies: we just accumulate the sign.

But careful: If there are multiple unary signs, the product of signs is correct: each '-' flips sign, each '+' does nothing. So sign = sign * (peek==='-' ? -1 : 1) works.

Now, we also need to handle the case where after consuming unary signs, we encounter a parenthesis. That's fine.

Now, parseExpression and parseTerm still use recursion? They call parseTerm and parseFactor, but those are not recursive in the sense of deep nesting? parseExpression calls parseTerm, which calls parseFactor, which may call parseExpression if parentheses. So parentheses cause recursion. That's unavoidable. But depth of parentheses is the only source of recursion depth. If parentheses are deeply nested, recursion depth equals nesting depth. That could be large. However, typical recursion limit in Node.js is about 10000 (V8 stack size). If nesting depth is >10000, it might crash. But the problem says "parentheses may be nested deeply", but not necessarily beyond 10000. However, to be safe, we could implement an iterative parser using shunting-yard algorithm, which avoids recursion. But shunting-yard also uses a stack for operators and operands, which is fine.

Given the requirement: "Implement a real parser or shunting-yard evaluator." So either is fine. I'll stick with recursive descent, but maybe I'll implement shunting-yard to be more robust and avoid recursion depth issues. However, shunting-yard also needs to handle unary operators, which is a bit tricky but doable.

But the problem says "Do not use eval, Function, vm, or external packages." So we are free to implement either.

I'll consider implementing a shunting-yard evaluator because it's a classic and avoids recursion depth issues. However, we need to handle unary operators. In shunting-yard, we can treat unary operators as separate tokens with higher precedence than multiplication/division. Typically, we parse numbers, and when we encounter '+' or '-', we need to determine if it's binary or unary. The rule: if the operator appears at the beginning of the expression or after an opening parenthesis or after another operator, it's unary; otherwise binary. We can assign different precedence: unary has higher precedence (maybe 5), multiplication/division (4), addition/subtraction (3). Or we can treat them as separate functions.

Alternatively, we can use a recursive descent parser but with iterative handling of unary signs as above, and for parentheses, we still have recursion. If we want to avoid recursion entirely, we could implement a parser that uses an explicit stack for parsing expressions (like a Pratt parser). But that's more complex.

Given the typical constraints, recursion is fine. I'll keep recursive descent with iterative unary sign handling.

But we need to ensure that the code is complete and correct.

Let's write the final code.

We'll include proper error handling? Not required, but we can throw if something unexpected.

We'll also ensure that we use Math.trunc for division.

Now, test with some examples mentally.

Example: "3 * 2 - 1" -> parseExpression: left = parseTerm -> parseFactor -> 3; then while '*'? yes, consume '*', right = parseFactor -> 2; left = 6; while? next char is '-', not '*' or '/', so exit parseTerm, return 6 to parseExpression. Then parseExpression sees '-', consume, right = parseTerm -> parseFactor -> 1; left = 6-1=5. Good.

Example: "-5 * 2" -> parseExpression: left = parseTerm -> parseFactor: sign accumulation: sees '-', sign=-1, consume; then parse operand: number 5 -> value=5, return -5. So left = -5. Then parseTerm: while '*'? yes, consume '*', right = parseFactor -> 2, left = -5*2 = -10. Return -10. parseExpression: while? no more + or -, return -10. Good.

Example: "1 + -2 * 3" -> parseExpression: left = parseTerm -> parseFactor -> 1; no '*' or '/', so term=1. Then parseExpression sees '+', consume, right = parseTerm -> parseFactor: sign accumulation: sees '-', sign=-1, consume; operand number 2 -> value=2, return -2. Then parseTerm: while '*'? yes, consume '*', right = parseFactor -> 3, left = -2*3 = -6. So right = -6. Then left = 1 + (-6) = -5. Good.

Example: "1 + 2 * -3" -> similar, right = 2 * (-3) = -6, sum -5.

Example: "(1+2)*(3-4)" -> parseExpression: left = parseTerm -> parseFactor: sees '(' -> parseExpression inside: left = parseTerm -> parseFactor -> 1; while '+'? yes, right = parseTerm -> parseFactor -> 2; left=3; return 3. Then parseTerm: while '*'? yes, consume '*', right = parseFactor: sees '(' -> parseExpression: 3-4 = -1; return -1. left = 3 * (-1) = -3. parseExpression: while? no, return -3. Good.

Now, check division truncation: "5 / 2" -> parseTerm: left = parseFactor -> 5; while '/'? yes, right = parseFactor -> 2; left = Math.trunc(5/2) = 2. Good. "-5 / 2" -> left = -5, right=2, Math.trunc(-5/2) = -2. Good. "5 / -2" -> Math.trunc(5/-2) = -2. Good. "-5 / -2" -> Math.trunc(2.5) = 2. Good.

Now, check unary plus: "+5" -> parseFactor: sign accumulation: sees '+', sign stays 1, consume; then operand 5 -> 5. Good.

Now, check nested unary: "--5" -> sign accumulation: first '-', sign=-1; second '-', sign=1; then operand 5 -> 5. Good.

Now, check "+-5" -> first '+', sign=1; second '-', sign=-1; operand 5 -> -5. Good.

Now, check "-+5" -> first '-', sign=-1; second '+', sign=-1; operand 5 -> -5. Good.

Now, check "1 - -2" -> parseExpression: left = parseTerm -> parseFactor -> 1; while '-'? yes, consume, right = parseTerm -> parseFactor: sign accumulation: sees '-', sign=-1, consume; operand 2 -> -2; left = 1 - (-2) = 3. Good.

Now, check "1 - - -2" -> left = 1; right = parseTerm: parseFactor: sign accumulation: first '-', sign=-1; second '-', sign=1; third '-', sign=-1; operand 2 -> -2; left = 1 - (-2) = 3? Actually 1 - (-2) = 3, but wait: - - -2 = -2? Let's compute: - - -2 = - ( - ( -2 ) )? Actually unary minus applied three times: -- -2 = -(-2) = 2? Let's do carefully: expression: 1 - - -2. The right side is term: parseFactor: signs: first '-', sign=-1; second '-', sign=1; third '-', sign=-1; then number 2 => -2. So right = -2. Then left = 1 - (-2) = 3. But is that correct mathematically? The expression "1 - - -2" means 1 minus (negative of negative of negative of 2). Let's evaluate: - - -2 = - ( - ( -2 ) ) = - ( 2 ) = -2? Actually: -2 is -2. Then -(-2) = 2. Then -(2) = -2. So - - -2 = -2. Then 1 - (-2) = 1 + 2 = 3. So 3 is correct. Good.

Now, check "1 - - +2" -> signs: '-', sign=-1; '-', sign=1; '+', sign=1; number 2 => 2. So right=2, left=1-2=-1. But math: - - +2 = - ( - ( +2 ) ) = - ( -2 ) = 2? Wait: +2 is 2. -2 = -2. -(-2) = 2. So - - +2 = 2. Then 1 - 2 = -1. Good.

Now, check "1 + 2 * 3 + 4" -> left = 1; then while '+'? after 1, but parseExpression sees '+'? Actually parseExpression first parses term: parseTerm: parseFactor 1, no '*', so term=1. Then parseExpression sees '+'? yes, consume, right = parseTerm: parseFactor 2, then while '*'? yes, consume '*', right=3, left=6, then while '+'? no, so term=6. left=1+6=7. Then while '+'? yes, consume, right = parseTerm: parseFactor 4, term=4. left=7+4=11. Good.

Now, check "2 * 3 * 4" -> parseTerm: left = parseFactor 2; while '*'? yes, consume, right = parseFactor 3, left=6; while '*'? yes, consume, right=4, left=24. Good.

Now, check "2 * 3 / 4" -> left=2; while '*'? yes, consume, right=3, left=6; while '/'? yes, consume, right=4, left=Math.trunc(6/4)=1. Good.

Now, check "2 / 3 * 4" -> left=2; while '/'? yes, consume, right=3, left=Math.trunc(2/3)=0; while '*'? yes, consume, right=4, left=0*4=0. Good.

Now, check "2 * 3 / 4 * 5" -> left=2; '*' => 6; '/' => Math.trunc(6/4)=1; '*' => 1*5=5. Good.

Now, check parentheses with unary: "-(5+3)" -> parseFactor: sign accumulation: sees '-', sign=-1, consume; then operand: '(' -> parseExpression: 5+3=8; return 8; then sign * 8 = -8. Good.

Now, check "(5)*(3)" -> parseTerm: parseFactor: '(' -> parseExpression 5 -> 5; then parseTerm: while '*'? yes, consume, right = parseFactor: '(' -> parseExpression 3 -> 3; left=15. Good.

Now, check "1+2*(3-4)*5" -> parseTerm: left = parseFactor 1? Actually parseExpression: left = parseTerm: parseFactor 1 -> 1; then parseTerm: while '*'? no; so term=1. Then parseExpression: while '+'? yes, consume, right = parseTerm: parseFactor 2 -> 2; then while '*'? yes, consume, right = parseFactor '(' -> parseExpression 3-4 = -1; left = 2 * -1 = -2; while '*'? yes, consume, right = parseFactor 5 -> 5; left = -2 * 5 = -10; so right = -10; then left = 1 + (-10) = -9. Good.

Now, check "1+2*3+4*5" -> we did.

Now, check "1+2*3+4*5+6" -> 1+6+20+6=33.

Now, check "1-2-3-4" -> left=1; while '-'? yes, consume, right=2, left=-1; while '-'? yes, consume, right=3, left=-4; while '-'? yes, consume, right=4, left=-8. Good.

Now, check "- - - - -5" -> five minuses: sign accumulation: each '-' flips sign; 5 flips => start sign=1; after 1: -1; after 2: 1; after 3: -1; after 4: 1; after 5: -1; then number 5 => -5. So result -5. Mathematically, odd number of minus signs gives negative, even gives positive. Good.

Now, check "+ + +5" -> sign stays 1, result 5.

Now, check "1+2+3" -> 6.

Now, check "1-2+3" -> 1-2= -1, +3=2.

Now, check "1+2-3" -> 0.

Now, check "1*2*3" -> 6.

Now, check "1*2/3" -> Math.trunc(2/3)=0.

Now, check "1/2*3" -> 0*3=0.

Now, check "1/(2*3)" -> parseTerm: left = parseFactor 1; while '/'? yes, consume, right = parseFactor '(' -> parseExpression 2*3=6; left = Math.trunc(1/6)=0. Good.

Now, check "(1+2)/(3-4)" -> parseTerm: left = parseFactor '(' -> parseExpression 3; while '/'? yes, consume, right = parseFactor '(' -> parseExpression -1; left = Math.trunc(3/-1)= -3? Actually 3/ -1 = -3, trunc = -3. Good.

Now, check "((1))" -> parseFactor: '(' -> parseExpression: parseTerm: parseFactor '(' -> parseExpression: parseTerm: parseFactor '(' -> parseExpression: parseTerm: parseFactor 1; return 1; then close; return 1. Good.

Now, check "1+(2)" -> parseExpression: left = parseTerm: parseFactor 1; then while '+'? yes, consume, right = parseTerm: parseFactor '(' -> parseExpression 2; left = 1+2=3. Good.

Now, check "1*(2)" -> parseTerm: left = parseFactor 1; while '*'? yes, consume, right = parseFactor '(' -> parseExpression 2; left = 2; return 2. Good.

Now, check "1-(2)" -> parseExpression: left = parseTerm: parseFactor 1; while '-'? yes, consume, right = parseTerm: parseFactor '(' -> parseExpression 2; left = 1-2 = -1. Good.

Now, check "1/(2)" -> parseTerm: left = parseFactor 1; while '/'? yes, consume, right = parseFactor '(' -> parseExpression 2; left = Math.trunc(1/2)=0. Good.

Now, check "1+-2" -> parseExpression: left = parseTerm: parseFactor 1; while '+'? yes, consume, right = parseTerm: parseFactor: sign accumulation: sees '-', sign=-1, consume, operand 2 => -2; left = 1 + (-2) = -1. Good.
