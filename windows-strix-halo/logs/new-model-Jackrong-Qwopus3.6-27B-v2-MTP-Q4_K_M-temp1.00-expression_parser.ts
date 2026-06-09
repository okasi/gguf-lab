function parseFactor(): number {
    skipSpaces();
    if (isCurrentChar('+') || isCurrentChar('-')) {
        let sign = isCurrentChar('+') ? 1 : -1;
        advance();
        let operand = parseFactor(); // recursive to handle nested unary and parentheses
        return sign * operand;
    } else if (isCurrentChar('(')) {
        advance(); // '('
        let result = parseExpression(); // parse inside
        skipSpaces();
        if (!isCurrentChar(')')) error;
        advance(); // ')'
        return result;
    } else if (isDigit(currentChar())) {
        return parseNumber();
    } else {
        error;
    }
}

But wait: This would treat unary operators as having the same precedence as parentheses? Actually, this approach makes unary operators part of the factor, which is the highest precedence (except numbers). That's correct. However, note that the order of checks matters: If we have something like "-(3+4)", the current char is '-', so we go into unary branch, advance, then recursively parse factor, which will see '(' and parse parentheses. That works. If we have "3+4", parseExpression will parse a term, which will parse a factor, which will parse a number. That's fine.

But we must ensure that unary operators are right-associative. Our recursive parseFactor handles that because when we see a '-', we advance and then call parseFactor again. So for "- - 5", we get sign -1, then parseFactor sees '-', sign -1, parseFactor sees number 5, returns 5, then we return -1 * (-1 * 5) = 5. That's correct: - -5 = 5.

But careful: The unary operator applies to the factor, which might be a product. For example, "- 2 * 3". According to precedence, unary - applies to 2 only, not to 2*3, because * has lower precedence than unary? Actually, typical precedence: unary - has higher precedence than multiplication, so "- 2 * 3" means (-2) * 3 = -6. In our parser, parseFactor sees '-', advances, then calls parseFactor. parseFactor will see '2' and parse number 2, returning 2. Then we return sign * 2 = -2. Then back in parseTerm, we will see '*' and parse next factor (3) and multiply: -2 * 3 = -6. That works because parseTerm expects a factor from parseFactor, and parseFactor returns the result of the unary expression. However, note that parseTerm will call parseFactor to get the left operand of a term. In parseTerm, we have:

function parseTerm(): number {
    let left = parseFactor();
    while (isCurrentChar('*') || isCurrentChar('/')) {
        let op = currentChar();
        advance();
        let right = parseFactor();
        if (op === '*') left = left * right;
        else if (op === '/') left = Math.trunc(left / right);
    }
    return left;
}

So when we have "- 2 * 3", parseTerm calls parseFactor. parseFactor sees '-', goes into unary, advances, calls parseFactor which returns 2, then returns -2. So left = -2. Then while loop sees '*', advances, right = parseFactor() => 3, left = -2 * 3 = -6. That's correct.

What about "2 * -3"? parseTerm: left = parseFactor() => 2. While sees '*', advances, right = parseFactor(). parseFactor sees '-', goes into unary, advances, calls parseFactor => 3, returns -3. So right = -3, left = 2 * -3 = -6. That's correct.

So the recursive descent works.

Now, we need to handle spaces properly. We'll have a pointer index, and a function skipSpaces() that increments while char is space.

We need to parse numbers: integers, possibly multiple digits, no decimal. We'll parse while isDigit.

We need to handle end of input.

We also need to ensure that after parsing the expression, we have consumed all characters (except maybe trailing spaces). We can check that after parseExpression, we are at end of string (or only spaces left). If there is any leftover non-space, it's an error.

Now, we must implement as TypeScript. We'll write a class or just functions.

We'll also handle errors? The problem doesn't specify error handling; we can assume input is valid.

We need to output the result as integer, maybe as a string.

Now, about division truncation: we use Math.trunc(left / right). However, note that for negative numbers, Math.trunc(-7/2) = -3, which is correct. But we must ensure that we don't get floating point inaccuracies for large numbers? Since numbers are safe integers, division yields a double that might be an exact representation of the quotient if it's an integer, but if not, it's a double approximation. However, Math.trunc on that double should give the correct integer truncation as long as the double can represent the integer part exactly. The integer part is within safe integer range, so it's fine.

But there is a subtlety: For very large numbers, say 2^52 * 3, but safe integers guarantee up to 2^53-1, so the quotient might be outside safe integer? The problem says "All intermediate values fit in JavaScript safe integers." That includes the result of division? It says intermediate values fit in safe integers, meaning during evaluation we won't exceed safe integer range. So we can use Number.

Thus, we can use Number.

Now, we need to implement reading from stdin: fs.readFileSync(0, "utf8").trim() maybe? But there could be trailing newline. We'll trim whitespace.

We'll parse the string.

Edge cases: unary + should just return the factor unchanged. Our code will set sign = 1 and then return 1 * operand, which is fine.

Now, let's write the code.

We'll define a class Calculator with properties: input string, index.

Methods: skipSpaces(), currentChar(), isDigit(), advance(), parseExpression(), parseTerm(), parseFactor(), parseNumber().

Then in main, we'll create an instance, parse, and log the result.

We'll also need to handle the possibility of an empty expression? Probably not.

Now, we need to ensure that the code compiles and runs.

Let's write the code.

But we need to be careful: The input may contain spaces between tokens. Our skipSpaces will handle that.

We'll also need to handle that after parsing a number, there might be more characters; we just return the number.

Now, test with some examples.

Example: "3 + 4" => 7.

Example: "2 * 3 + 4" => 10.

Example: "2 * (3 + 4)" => 14.

Example: "-5 + 3" => -2.

Example: "5 - -3" => 8.

Example: "7 / 2" => 3 (since truncation towards zero, 7/2=3.5 -> 3).

Example: "-7 / 2" => -3 (since -3.5 trunc to -3).

Example: "3 / -2" => -1 (since -1.5 trunc to -1).

Example: " - (3 + 4) * 2 " => -14.

Example: "1 + 2 * 3 - 4" => 3.

All should work.

Now, consider potential pitfalls: The unary operator recursion could cause stack overflow if many unary operators? But given constraints, it's fine.

Now, about the shunting-yard alternative: It's also okay, but recursive descent is simpler.

We need to ensure that we handle operator precedence correctly: Our parseExpression handles + and - at lowest precedence, parseTerm handles * and /, parseFactor handles unary and numbers and parentheses. That matches precedence: unary > * / > + -.

But wait: In some definitions, unary operators have higher precedence than binary, but sometimes unary - is considered same as binary? No, typical arithmetic: unary - has higher precedence than multiplication. So our order is correct.

But we must also consider that parentheses override precedence.

Now, we must ensure that we treat unary + as no-op but still parse.

Now, one more nuance: In some expressions like "2 - 3 - 4", left-associativity should be applied. Our parseExpression while loop processes left to right, so that's left-associative.

Similarly, for * and /.

Now, about division truncation: We need to ensure that the division is integer division truncating toward zero. Using Math.trunc is correct.

Now, we need to output the result as integer, maybe as a string. We'll console.log(result).

Now, the code:

import * as fs from 'fs';

class Calculator {
    private input: string;
    private index: number;

    constructor(input: string) {
        this.input = input;
        this.index = 0;
    }

    private skipSpaces() {
        while (this.index < this.input.length && this.input[this.index] === ' ') {
            this.index++;
        }
    }

    private currentChar(): string | undefined {
        return this.input[this.index];
    }

    private isDigit(): boolean {
        const c = this.currentChar();
        return c !== undefined && c >= '0' && c <= '9';
    }

    private advance(): string | undefined {
        return this.input[this.index++];
    }

    private parseExpression(): number {
        let result = this.parseTerm();
        while (this.index < this.input.length) {
            this.skipSpaces();
            const ch = this.currentChar();
            if (ch === '+' || ch === '-') {
                const op = ch;
                this.advance();
                const right = this.parseTerm();
                if (op === '+') {
                    result += right;
                } else {
                    result -= right;
                }
            } else {
                break;
            }
        }
        return result;
    }

    private parseTerm(): number {
        let result = this.parseFactor();
        while (this.index < this.input.length) {
            this.skipSpaces();
            const ch = this.currentChar();
            if (ch === '*' || ch === '/') {
                const op = ch;
                this.advance();
                const right = this.parseFactor();
                if (op === '*') {
                    result = result * right;
                } else {
                    result = Math.trunc(result / right);
                }
            } else {
                break;
            }
        }
        return result;
    }

    private parseFactor(): number {
        this.skipSpaces();
        const ch = this.currentChar();
        if (ch === '+' || ch === '-') {
            const sign = ch === '+' ? 1 : -1;
            this.advance();
            const operand = this.parseFactor();
            return sign * operand;
        } else if (ch === '(') {
            this.advance();
            const result = this.parseExpression();
            this.skipSpaces();
            if (this.currentChar() !== ')') {
                throw new Error("Mismatched parentheses");
            }
            this.advance();
            return result;
        } else if (this.isDigit()) {
            return this.parseNumber();
        } else {
            throw new Error("Unexpected character");
        }
    }

    private parseNumber(): number {
        this.skipSpaces();
        let num = 0;
        while (this.index < this.input.length && this.isDigit()) {
            num = num * 10 + (this.input[this.index] - '0');
            this.advance();
        }
        return num;
    }

    public evaluate(): number {
        const result = this.parseExpression();
        this.skipSpaces();
        if (this.index < this.input.length) {
            throw new Error("Unexpected trailing characters");
        }
        return result;
    }
}

const input = fs.readFileSync(0, 'utf-8').trim();
const calculator = new Calculator(input);
const result = calculator.evaluate();
console.log(result);

That should work.

But we need to consider that the input might contain leading/trailing spaces, which we trim. But also there might be spaces inside, which we handle.

One potential issue: In parseNumber, we call skipSpaces() before reading digits, but we already skip spaces at the beginning of parseFactor. So it's fine.

Now, test with some tricky cases: "1 + 2 * 3" => 7.

What about unary +: "+5" => 5.

What about multiple unary: "- + - 5" => - ( + ( -5) )? Actually, "- + - 5": first - sign, then parseFactor sees +, sign=1, parseFactor sees -, sign=-1, parseFactor sees number 5 => 5, then -1*5 = -5, then 1*(-5) = -5, then -1*(-5)=5? Let's compute: "- + - 5". According to typical math, unary operators associate right-to-left? Actually, unary operators are right-associative, meaning they apply from rightmost first. But the expression "- + - 5" could be interpreted as -(+(-5)) = -(+(-5)) = -(-5) = 5? Wait: Let's compute stepwise: Start from innermost: -5 => -5. Then +(-5) => -5. Then -(-5) => 5. So result 5. Our parser: parseFactor sees '-', sign=-1, then calls parseFactor which sees '+', sign=1, then calls parseFactor which sees '-', sign=-1, then calls parseFactor which sees number 5 => 5. Then returns -1*5 = -5. Then back to +: returns 1 * (-5) = -5. Then back to -: returns -1 * (-5) = 5. So result 5. That's correct.

Now, consider "2 * -3". parseFactor for left: 2. Then while sees '*', advances, right = parseFactor. parseFactor sees '-', sign=-1, parseFactor sees number 3 => 3, returns -3. So result 2 * -3 = -6. Good.

Now, consider "2 / -3". 2 / -3 = -0.666, trunc toward zero => 0? Actually, 2 / -3 = -0.666..., trunc toward zero => 0. Our code: Math.trunc(2 / -3) = 0. That's correct.

Now, consider " - 2 / 3". -2/3 = -0.666, trunc => 0? Actually, -2/3 = -0.666, trunc toward zero => 0. Our code: parseTerm: left = parseFactor => -2, then while sees '/', right = parseFactor => 3, result = Math.trunc(-2 / 3) = 0. That's correct.

But is that the expected? Typically integer division in many languages truncates toward zero, so -2/3 = 0. Yes.

Now, consider " 3 / -2 ". 3 / -2 = -1.5 trunc => -1. Good.

Now, we need to ensure that the code uses TypeScript and compiles. We'll include the import for fs.

Now, the problem says "Do not use /dev/stdin. Read stdin with fs.readFileSync(0, "utf8")." So we are doing that.

Also "Return only TypeScript code, no explanation and no Markdown fence." So we need to output the code as plain text, not wrapped in markdown.

Thus, final answer should be the code.

But before finalizing, check for any missing pieces: We need to handle potential large numbers that exceed safe integer? The problem says they fit, so okay.

We also need to consider that the input might have no expression? Probably not.

We should also consider that the expression might start with a unary operator after spaces, which is fine.

Now, test with a more complex expression: "((2+3)*(4-1))/5 + -2" => (5*3)/5 + -2 = 15/5 -2 = 3-2=1. Let's manually compute: 2+3=5, 4-1=3, product=15, /5=3, + -2 = 3 + (-2) = 1. Our parser should handle.

Now, check for potential infinite recursion: parseFactor calls itself recursively for unary operators. That's fine.

Now, check for potential issue with the order of checks in parseFactor: We check for unary first, then parentheses, then number. But what if the expression is like "+(3+4)"? It's fine: sees '+', advances, then parseFactor sees '(' and parses parentheses. That yields 1 * (3+4) = 7. Good.

What about "-(3+4)"? Works.

What about "((5))"? Works.

Now, we need to ensure that after parsing a number, we don't accidentally consume spaces that belong to next token? In parseNumber, we advance while digits, then return. The next token will be handled by the caller's while loop, which will skip spaces before checking for operators. So it's fine.

Now, potential bug: In parseExpression, after reading a term, we skip spaces and check for + or -. But what if there is no operator, we break. However, if there is a space and then a character that is not an operator (like ')'), the loop will break because ch is not '+' or '-'. That's fine.

But we need to ensure that we don't skip spaces before checking the character that could be part of a number? Actually, the while condition checks after skipping spaces. If the next non-space character is not '+' or '-', we break, and that's correct because that means we have reached the end of the expression at this level (e.g., after a term we might have ')' or end of string). However, what if there is a number directly after an operator? That's not allowed; operators must be between numbers. But our parsing will handle that because after reading an operator, we call parseTerm which will parse a factor, which will parse a number. So the structure is enforced.

Now, consider the case of a unary operator after an opening parenthesis: "(-5+3)". In parseExpression inside parentheses, we parse term, etc. That's fine.

Now, we should also consider that there might be spaces between digits? No, numbers are contiguous digits.

Now, we need to make sure that we treat the input as a single line, but readFileSync reads all; we trim it. That's fine.

Now, we need to output only the integer, no extra whitespace. console.log prints with newline, which is fine.

Now, we might want to use BigInt to be safe? But the problem says all intermediate values fit in safe integers, so Number is okay.

But there is a nuance: Division truncation toward zero: For positive numbers, Math.trunc(a/b) works. For negative numbers, it also works. However, if a and b are large, a/b might be a double that loses precision, but the integer part is within safe integer range, so it's fine. For example, 2^52 / 2^40 yields a number that is an integer? Actually, 2^52 / 2^40 = 2^12 = 4096, exactly representable. If the division is not exact, the double approximation might be off by a tiny epsilon, but Math.trunc will still give the correct integer if the integer part is within 2^53. For example, 7/2 = 3.5, double is exactly 3.5. For larger numbers, say (2^53-1) / 2 = about 9e15, double can represent that exactly? Actually, 2^53-1 is the max safe integer, but as a double, it's exactly representable? 2^53-1 is an integer that can be represented exactly in double because double has 53 bits of mantissa, so any integer up to 2^53 can be represented exactly. So division by 2 yields a number that might not be an integer; e.g., (2^53-1)/2 = (9007199254740991)/2 = 4503599627370495.5, which as a double is exactly 4503599627370495.5? Actually, double can represent half-integers exactly as long as the integer part fits in mantissa. 4503599627370495.5 can be represented exactly because the mantissa can represent 0.5 exactly if the integer part is within range. Since 4503599627370495 fits in 53 bits, adding 0.5 is just setting the least significant bit to 0.5, which is representable. So it's fine.

Thus, using Math.trunc is safe.

Now, we need to ensure that we don't use any external packages; we only use fs and Math.

Now, the code is ready.

But we should consider the possibility of using a shunting-yard algorithm as requested? The problem says "Implement a real parser or shunting-yard evaluator." So recursive descent is a parser, so it's acceptable.

Now, we need to output only the TypeScript code. We'll include the import and the class.

We'll also add a check for empty input? Not necessary.

Now, I'll produce the final answer.

But wait: The problem says "Return only TypeScript code, no explanation and no Markdown fence." So we should output the code as plain text, not in a code block. But the platform might expect just the code. However, it's ambiguous: Usually in these responses, we can output the code with proper formatting, but they said no Markdown fence, so we should not use triple backticks. So we'll just output the code as plain text, but it's still code. It might be okay to have newlines and indentation.

Thus, final answer: the TypeScript code.

Now, I'll write it.

But before final, test with some edge cases manually by mental simulation.

Edge case: " 1 " => 1.

Edge case: "+1" => 1.

Edge case: "-1" => -1.

Edge case: "1-1" => 0.

Edge case: "1*2*3" => 6.

Edge case: "1/2/3" => (1/2)=0 trunc => 0, then 0/3=0. But integer division truncation: 1/2 = 0, 0/3 = 0. That's fine. But some might expect 1/(2/3) but left-associativity ensures (1/2)/3. Our parser does left-associative, so correct.

Edge case: "1/(2/3)" => 1 / (0)?? Actually, 2/3=0, then 1/0 would be infinite or error. But the problem says all intermediate values fit in safe integers, so division by zero likely not present. So we can ignore.

Edge case: "0/1" => 0.

Edge case: "-0" => 0, fine.

Edge case: " 0 " => 0.

Edge case: " 007 " => 7.

Now, test with a deep nesting: "(((2)))" => 2.

Now, check for potential bug: In parseFactor, after handling unary, we recursively call parseFactor. That will also skip spaces. That's fine.

Now, what about the case where there is a unary operator followed by a space and then a number: "- 5". Our parseFactor sees '-', advances, then calls parseFactor. Inside parseFactor, we skip spaces, then see digit, parse number. So it works.

Now, what about unary operator followed by a parenthesis: "- (5+3)". parseFactor sees '-', advances, then parseFactor sees '(', parses expression, returns 8, then returns -8. Good.

Now, consider if there is a unary operator followed by another unary operator without spaces: "--5". That's fine.

Now, consider if there is a unary operator followed by a multiplication: "-2*3". Already tested.

Now, consider if there is a unary operator after a binary operator: "1- -2". parseExpression: left = parseTerm => 1. Then while sees '-', advances, right = parseTerm => parseFactor => '-' => sign=-1, parseFactor => number 2 => 2, returns -2? Actually, parseFactor for '-' returns -2? Let's step: parseTerm calls parseFactor for right. parseFactor sees '-', sign=-1, advances, calls parseFactor which sees digit 2, returns 2, then returns -2. So right = -2. Then result = 1 - (-2) = 3. That's correct.

Now, check for operator precedence: "2*3+4" => 10. parseExpression: parseTerm yields 2*3=6, then while sees '+', right = parseTerm => 4, result=10. Good.

Now, "2+3*4" => 14. parseExpression: left = parseTerm => 2, while sees '+', right = parseTerm => 3*4=12, result=14. Good.

Now, "2+3*4+5" => 23. Good.

Now, "2*3+4*5" => 6+20=26. Good.

Now, "2+3-4*5" => 2+3=5, 4*5=20
