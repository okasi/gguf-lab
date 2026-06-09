const input = fs.readFileSync(0, 'utf8').trim();
let pos = 0;

function peek() { return input[pos]; }
function advance() { pos++; }

function skipSpaces() { while(pos < input.length && /\s/.test(input[pos])) pos++; }

function parseExpression(): number {
    let result = parseTerm();
    while(pos < input.length && (input[pos] === '+' || input[pos] === '-')) {
        let op = input[pos];
        advance();
        let right = parseTerm();
        if(op === '+') result = result + right;
        else result = result - right;
    }
    return result;
}

function parseTerm(): number {
    let result = parseFactor();
    while(pos < input.length && (input[pos] === '*' || input[pos] === '/')) {
        let op = input[pos];
        advance();
        let right = parseFactor();
        if(op === '*') result = result * right;
        else {
            // division truncates toward zero
            result = Math.trunc(result / right);
        }
    }
    return result;
}

function parseFactor(): number {
    // parse unary operators
    if(pos < input.length && (input[pos] === '+' || input[pos] === '-')) {
        let sign = input[pos] === '-' ? -1 : 1;
        advance();
        let val = parseFactor(); // recursively parse unary or primary
        return sign * val;
    }
    // else parse primary
    return parsePrimary();
}

function parsePrimary(): number {
    skipSpaces();
    if(pos < input.length && input[pos] === '(') {
        advance(); // '('
        let val = parseExpression();
        skipSpaces();
        // expect ')'
        if(pos < input.length && input[pos] === ')') {
            advance();
        } else {
            // error, but assume valid
        }
        return val;
    } else {
        // parse integer
        let start = pos;
        while(pos < input.length && /\d/.test(input[pos])) pos++;
        if(pos === start) {
            // error: no integer
        }
        let num = parseInt(input.substring(start, pos), 10);
        return num;
    }
}

After parsing, skipSpaces and ensure we consumed all input (maybe ignore trailing). Then output result.

Now we need to be careful: The unary operators can appear multiple times, like --5. Our parseFactor handles that recursively: if we see '+', '-', we take sign and then parseFactor again. That will parse any number of unary operators. Good.

Now test with examples:

Expression: "1+2*3" => 1 + (2*3)=7.

"1*2+3" => (1*2)+3=5.

"-2*3" => (-2)*3 = -6.

"5-3" => 2.

"5-3*2" => 5 - (3*2) = -1.

"(1+2)*3" => 3*3=9.

"-(-5)" => 5.

"10 / 3" => 3 (truncated).

"-10 / 3" => -3 (truncated toward zero). Because -10/3 = -3.333, trunc => -3.

"10 / -3" => -3.

"-10 / -3" => 3.

Now check precedence: unary +/- highest, so "-2*3" is (-2)*3. Good.

But what about "-2+3*4"? parse: unary on 2, then term: -2 *? Actually parseExpression: parseTerm => parseFactor => unary => -2, then term loop: '*'? No, after -2, next char is '+', so term ends. Then expression: result = -2, then '+' then parseTerm => parseFactor => 3, then '*' then parseFactor => 4 => 12, so result = -2 + 12 = 10. That's correct: -2 + (3*4) = 10.

Now test: "1 + -2" => unary minus on 2, so 1 + (-2) = -1. parseExpression: parseTerm => parseFactor => parsePrimary => 1. Then term loop: next is '+'? Actually after 1, we have space, then '+', then parseTerm: parseFactor => unary? The char after '+' is '-', so parseFactor sees '-' => sign=-1, then parseFactor again => parsePrimary => 2, so -2. So result = 1 + (-2) = -1. Good.

Now test: "1 * -2" => 1 * (-2) = -2. parseTerm: result=1, then '*' then parseFactor => unary? The char after '*' is '-', so parseFactor sees '-' => sign=-1, then parseFactor => parsePrimary => 2, so -2. result=1 * -2 = -2. Good.

Now test: "- - 5" => unary minus twice => -(-5)=5. parseFactor: sees '-', sign=-1, then parseFactor again => sees '-', sign=-1, then parseFactor => parsePrimary => 5, so (-1)*((-1)*5)=5. Good.

Now test: "5 - - 3" => 5 - (-3) = 8. parseExpression: parseTerm => 5, then '-', parseTerm => parseFactor => unary '-' => sign=-1, parseFactor => parsePrimary => 3 => -3, so 5 - (-3) = 8. Good.

Now test: "(5) - -3" => 5 - (-3) = 8. Good.

Now test: "1 + 2 * -3" => 1 + (2 * -3) = 1 + -6 = -5. parseExpression: parseTerm => parseFactor => 1, then term loop: '*' then parseFactor => unary? After '*', we have '-3', so parseFactor sees '-' => sign=-1, parseFactor => parsePrimary => 3 => -3, so 2 * -3 = -6. Then expression: 1 + (-6) = -5. Good.

Now test: "1 * -2 + 3" => (1 * -2) + 3 = -2+3=1. parseTerm: result=1, '*' then parseFactor => unary '-' => -2, result = -2. Then expression: -2 + 3 = 1. Good.

Now test: "1 / 3" => 0. parseTerm: result=1, '/' then parseFactor => 3, result = Math.trunc(1/3)=0. Good.

Now test: "-1 / 3" => 0? Actually -1/3 = -0.333, trunc => 0. Good.

Now test: "1 / -3" => 0? Actually 1/-3 = -0.333, trunc => 0. Good.

Now test: "-1 / -3" => 0? Actually -1/-3 = 0.333, trunc => 0. Good.

Now test: "5 / 2" => 2.

Now test: "-5 / 2" => -2 (since -2.5 trunc toward zero => -2). Good.

Now test: "5 / -2" => -2.

Now test: "-5 / -2" => 2.

Now test: "0 / 5" => 0.

Now test: "5 / 0"? Division by zero? Not specified, but probably input won't have division by zero. But we could handle? Not needed.

Now test: "1 + 2" => 3.

Now test: "  1 + 2  " => 3.

Now test: "(1+(2*3))/4" => (1+6)/4 = 7/4 = 1. parseExpression: parsePrimary: '(' -> parseExpression: parseTerm: parseFactor: 1, then term loop? Actually inside parentheses: 1 + (2*3). parseExpression: parseTerm => 1, then '+' then parseTerm => parseFactor => 2, then '*' then parseFactor => 3 => 6, so result 1+6=7. Then primary returns 7. Then parseTerm: result=7, then '/' then parseFactor => 4, result = Math.trunc(7/4)=1. Good.

Now test: "((5))" => 5.

Now test: "1 * (2 + 3)" => 1 * 5 = 5. parseTerm: result=1, '*' then parseFactor => parsePrimary => '(' => parseExpression => 2+3=5, so result=5. Good.

Now test: "- (1+2)" => -3. parseFactor: sees '-', sign=-1, then parseFactor => parsePrimary => '(' => parseExpression => 1+2=3, so result=-3. Good.

Now test: "+ (1+2)" => 3. parseFactor: sees '+', sign=1, then parseFactor => parsePrimary => '(' => parseExpression => 3, so result=3. Good.

Now test: "1 + - (2 * 3)" => 1 + -6 = -5. parseExpression: parseTerm => 1, then '+' then parseTerm => parseFactor => unary '-' => sign=-1, parseFactor => parsePrimary => '(' => parseExpression => 2*3=6, so -6, result=1 + -6 = -5. Good.

Now test: "1 - - (2)" => 1 - (-2) = 3. parseExpression: parseTerm => 1, then '-' then parseTerm => parseFactor => unary '-' => sign=-1, parseFactor => parsePrimary => '(' => parseExpression => 2, so -2, result=1 - (-2)=3. Good.

Now test: "1 * - - 2" => 1 * -(-2) = 1 * 2 = 2? Actually - - 2 = 2, so 1*2=2. parseTerm: result=1, '*' then parseFactor => unary '-' => sign=-1, then parseFactor => unary '-' => sign=-1, then parsePrimary => 2, so (-1)*((-1)*2)=2, so result=2. Good.

Now test: "1 + - + 2" => 1 + (-(+2)) = 1 + (-2) = -1. parseExpression: parseTerm => 1, then '+' then parseTerm => parseFactor => unary '-' => sign=-1, parseFactor => unary '+' => sign=1, parsePrimary => 2 => (+2)=2, then -1*2 = -2, so 1 + -2 = -1. Good.

Now test: "1 * + - 2" => 1 * (+(-2)) = 1 * (-2) = -2. parseTerm: result=1, '*' then parseFactor => unary '+' => sign=1, parseFactor => unary '-' => sign=-1, parsePrimary => 2 => -2, result=1 * -2 = -2. Good.

Now test: "1 / - 2" => 1 / -2 = 0? Actually 1 / -2 = -0.5, trunc => 0. Good.

Now test: "1 / + 2" => 1/2 = 0.

Now test: "1 / - - 2" => 1 / 2 = 0.

Now test: "1 / (2 + 3)" => 1/5 = 0.

Now test: "10 / 3" => 3.

Now test: "10 / -3" => -3.

Now test: "-10 / 3" => -3.

Now test: "-10 / -3" => 3.

Now test: "0 / 5" => 0.

Now test: "5 / 1" => 5.

Now test: "1 * 2 * 3" => 6.

Now test: "1 * 2 / 3" => 2/3 = 0? Actually (1*2)/3 = 2/3 = 0. But if left-associative: (1*2)=2, then 2/3=0. Good.

Now test: "1 / 2 * 3" => (1/2)=0, then 0*3=0. That's left-associative. But mathematically, 1/2*3 = (1/2)*3 = 0*3=0, but some might interpret as 1/(2*3)=1/6=0 anyway. But left-associative is standard. Our parser will do left-associative because in parseTerm we loop: after first factor, we check for '*' or '/', and apply sequentially. So that yields left-associative.

Now test: "1 + 2 + 3" => 6.

Now test: "1 - 2 - 3" => -4 (left-assoc: (1-2)=-1, -1-3=-4). Good.

Now test: "1 - (2 - 3)" => 1 - (-1) = 2. parseExpression: parseTerm => 1, then '-' then parseTerm => parseFactor => parsePrimary => '(' => parseExpression => 2-3=-1, so 1 - (-1)=2. Good.

Now test: "1 - 2 - (3)" => -4? Actually 1-2-3 = -4. Good.

Now test: "1 - 2 - 3" => -4.

Now test: "1 - (2+3)" => -4.

Now test: "1 - 2 + 3" => 2.

Now test: "1 + 2 - 3" => 0.

Now test: "1 + 2 * 3 - 4" => 1+6-4=3.

Now test: "1 * 2 + 3 * 4" => 2+12=14.

Now test: "1 * 2 * 3 + 4" => 6+4=10.

Now test: "1 + 2 * 3 * 4" => 1+24=25.

Now test: "1 - 2 * 3" => 1-6=-5.

Now test: "1 * -2" => -2.

Now test: "1 * -2 + 3" => -2+3=1.

Now test: "1 + -2 * 3" => 1 + (-6) = -5.

Now test: "-2 * 3 + 4" => -6+4=-2.

Now test: "2 * -3 + 4" => -6+4=-2.

Now test: "2 * (3 + 4)" => 14.

Now test: "-2 * (3 + 4)" => -14.

Now test: "2 * - (3 + 4)" => 2 * -7 = -14.

Now test: "2 * - - (3 + 4)" => 2 * 7 = 14.

Now test: "2 * - + (3 + 4)" => 2 * -7 = -14.

Now test: "2 * + - (3 + 4)" => 2 * -7 = -14.

Now test: "2 * + + (3 + 4)" => 2 * 7 = 14.

Now test: "2 * - - - (3 + 4)" => 2 * -7 = -14.

Now test: "2 * - - - - (3 + 4)" => 2 * 7 = 14.

Now test: "1 / 2 / 3" => (1/2)=0, 0/3=0. Good.

Now test: "1 / 2 * 3" => 0*3=0.

Now test: "1 * 2 / 3" => 2/3=0.

Now test: "10 / 2 / 3" => (10/2)=5, 5/3=1.

Now test: "10 / 3 / 2" => (10/3)=3, 3/2=1.

Now test: "10 / (3/2)" => 10 / 1 = 10? Actually 3/2=1, so 10/1=10. But our parser would compute inside parentheses: parseExpression => 3/2=1, then 10/1=10. Good.

Now test: "10 / (2/3)" => 10 / 0 = Infinity? Actually 2/3=0, division by zero. But input probably valid.

Now test: "10 / 0" => division by zero, but we can let it produce Infinity or NaN? Not required.

Now we need to ensure that we handle large numbers safely. Since all intermediate values fit in safe integers, we don't need BigInt. JavaScript numbers up to 2^53-1 are safe for integer arithmetic. Multiplication may exceed that? But problem says all intermediate values fit, so we can trust.

Now implement.

But we need to be careful: The unary operators have higher precedence than multiplication, but also they can be applied to results of multiplication? Actually if we have -2*3, the unary minus binds to 2, not to the result of multiplication. So our grammar ensures that because Factor includes UnaryFactor which then goes to Primary. So unary operators are parsed before multiplication. That's correct.

Now we need to handle potential overflow? Not needed.

Now we need to produce a complete TypeScript program. We'll include imports: import * as fs from 'fs';

But note: In Node.js, we can use require('fs') as well. But TypeScript can use import.

We'll write:

import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
let pos = 0;

function skipSpaces(): void { ... }
function peek(): string | undefined { ... }

But we don't need peek.

We'll implement functions as described.

We'll also need to handle the case where the input might be empty? Probably not.

Now output: console.log(result);

Now test with sample: Input: "1+2*3" -> output: 7.

Now we must ensure that the program is self-contained and runs with Node.js.

Now produce final code.

But we need to be careful about division truncation toward zero: Math.trunc works for positive and negative. However, for negative numbers, Math.trunc(-2.9) = -2, which is toward zero. Good.

But note: In JavaScript, Math.trunc is available since ES2015. Node.js supports it.

Alternatively, we could use (a / b) | 0, but that truncates toward zero only for numbers within 32-bit range; but intermediate values might exceed 32-bit, so Math.trunc is safer.

We'll use Math.trunc.

Now implement.

One more nuance: The unary operators can be applied to a number or to a parenthesized expression. In our parseFactor, we recursively call parseFactor when we see a unary operator. That works, but note that after consuming a unary operator, we call parseFactor again, which could again see a unary operator or a primary. That's fine.

But we need to ensure that we don't accidentally treat a unary operator as part of a number? For example, "1+-2" is valid: 1 + (-2). Our parser will parse 1, then see '+', then parseTerm: parseFactor will see '-', so unary minus, then parseFactor again: parsePrimary => 2, so -2. Good.

Now what about "1- -2"? Same.

Now what about "1 * - 2"? Already covered.

Now what about "1 / - 2"? Same.

Now what about "1 + - - 2"? parseTerm: parseFactor => unary '-', then parseFactor => unary '-', then parsePrimary => 2 => (-1)*((-1)*2)=2, so 1+2=3. Good.

Now what about "1 + - - - 2"? => 1 + -2 = -1? Actually - - - 2 = - (-( -2 )) = - (2) = -2? Let's compute: - - - 2: first unary: - ( - - 2 ). - - 2 = 2, so -2. So 1 + (-2) = -1. Our parser: parseFactor: sees '-', sign=-1, then parseFactor: sees '-', sign=-1, then parseFactor: sees '-', sign=-1, then parsePrimary => 2 => (-1)*((-1)*((-1)*2)) = (-1)*(2) = -2? Let's compute: innermost: (-1)*2 = -2. Then next: (-1)*(-2) = 2. Then next: (-1)*2 = -2. So result -2. Then 1 + (-2) = -1. Good.

Now we need to ensure that we don't have infinite recursion if we have many unary operators; but it's fine.

Now about whitespace: We skip spaces before reading numbers and before checking operators. But we also need to skip spaces after reading a number or after reading a closing parenthesis. In parsePrimary, after reading integer, we don't skip spaces because the next character could be an operator. But we should skip spaces before checking for operator in parseExpression and parseTerm loops. We'll call skipSpaces at the beginning of those functions or before checking char. But easier: In parseExpression and parseTerm, before checking for operator, we can call skipSpaces. But we also need to skip spaces before reading the next term/factor. Our loops currently check while(pos < input.length && (input[pos] === '+' || ...)). But if there are spaces, the character at pos might be space, not operator. So we need to skip spaces before checking. So we should incorporate skipSpaces before the while condition. However, we also need to skip spaces before parsing the right operand. For example, after seeing '+', we advance, then we need to skip spaces before parsing Term. So we can call skipSpaces at the start of parseTerm and parseFactor and parsePrimary? But parseTerm calls parseFactor, which calls parseUnary, which calls parsePrimary. So if we skip spaces at the beginning of each function, we might skip spaces that are not needed? Actually we want to skip spaces before reading a number or '(' or unary operator. But if we skip spaces at the beginning of parseFactor, that's fine. But careful: In parseExpression, after we parse a Term, we want to check for '+' or '-' operators. There might be spaces between the term and the operator. So we should skip spaces before checking the operator. So we can call skipSpaces before the while condition. Similarly, after we consume the operator, we need to skip spaces before parsing the next Term. So we can call skipSpaces at the beginning of parseTerm. So we can structure: In parseExpression:

let result = parseTerm();
while (true) {
    skipSpaces();
    if (pos < input.length && (input[pos] === '+' || input[pos] === '-')) {
        let op = input[pos];
        advance();
        skipSpaces(); // optional but not necessary if parseTerm skips
        let right = parseTerm();
        result = op === '+' ? result + right : result - right;
    } else {
        break;
    }
}

But we can combine: after checking operator, we can advance and then parseTerm directly; parseTerm will skip spaces at its start. So we don't need extra skipSpaces inside the loop except before checking operator. But we must ensure that parseTerm skips spaces before reading a factor. So we need to implement skipSpaces at the beginning of parseTerm, parseFactor, parsePrimary. But parseFactor may be called after a unary operator; we don't want to skip spaces between the unary operator and the operand? Actually spaces are allowed: "- 2" should be parsed as unary minus applied to 2. So after we consume '-', we should skip spaces before parsing the operand. So in parseFactor, when we see a unary operator, we should skip spaces before recursively calling parseFactor. But our current parseFactor implementation just checks input[pos] for '+' or '-', and if found, consumes and then calls parseFactor recursively. However, there might be spaces between the unary operator and the operand, e.g., "- 2". In that case, after consuming '-', pos is at the space; then we call parseFactor again, but parseFactor will check input[pos] which is a space, not a unary operator or digit or '('; so it would go to parsePrimary, which will skip spaces and then parse integer 2. That's fine. But parseFactor's recursive call will first skip spaces? Not if we don't skip spaces at the beginning of parseFactor. But parseFactor will then call parsePrimary, which will skip spaces. So it's okay. However, we need to ensure that after consuming a unary operator, we don't accidentally treat the space as something else. Since parseFactor will not match '+' or '-' if it's a space, it will go to parsePrimary, which will skip spaces and then parse number. So that works.

But consider " - 2". The first character is space. Our parser starts at parseExpression, which calls parseTerm, which calls parseFactor. At parseFactor, input[pos] is space, not '+' or '-', so it goes to parsePrimary. parsePrimary skips spaces, then sees '-', but '-' is not '(' or digit, so it would try to parse integer? That would fail because '-' is not a digit. But " - 2" is not a valid expression? Actually " - 2" could be interpreted as unary minus applied to 2, but the minus sign is after a space. The expression " - 2" is just "-2" with leading space. The minus sign is the first non-space character. So after skipping spaces at the beginning of parsePrimary, we would be at the minus sign. But parsePrimary expects either '(' or digit. It does not handle unary operators. So " - 2" would be parsed incorrectly because parsePrimary would not see a digit or '('; it would try to parse integer and fail. However, in our grammar, unary operators are handled in parseFactor, not parsePrimary. So the parser should first check for unary operators in parseFactor. So when we have " - 2", the first character is space. parseExpression calls parseTerm, which calls parseFactor. parseFactor should skip spaces? Actually parseFactor should not skip spaces before checking for unary operators because we want to see if the first non-space character is a unary operator. But if
