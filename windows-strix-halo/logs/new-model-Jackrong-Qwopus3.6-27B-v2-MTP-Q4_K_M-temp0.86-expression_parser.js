"use strict";
function parseExpr() {
    let left = parseTerm();
    while (currentToken)
        is;
    '+';
    or;
    '-';
    {
        let op = currentToken;
        advance();
        let right = parseTerm();
        left = apply(op, left, right);
    }
    return left;
}
function parseTerm() {
    let left = parseFactor();
    while (currentToken)
        is;
    '*';
    or;
    '/';
    {
        let op = currentToken;
        advance();
        let right = parseFactor();
        left = apply(op, left, right);
    }
    return left;
}
function parseFactor() {
    // handle unary + and -
    while (currentToken)
        is;
    '+';
    or;
    '-';
    {
        let sign = currentToken;
        advance();
        // The unary operator applies to the following factor
        // We need to get the value of the factor and then apply sign
        // But careful: if we have multiple unary operators like "--5", we need to parse recursively.
        // So we can parse the factor recursively, then apply sign.
        // However, if we do a while loop, we need to combine signs. For example, "- -5" => unary minus then unary minus then 5. The value is (-(-5)) = 5.
        // We can accumulate sign: start with 1, for each unary minus, flip sign; for unary plus, no change.
        // But we must parse the factor after the unary operators, which could be a number or parentheses.
        // So we can do:
        // let sign = 1;
        // while (currentToken is '+' or '-') {
        //   if (currentToken === '-') sign = -sign;
        //   advance();
        // }
        // let value = parsePrimary();
        // return sign * value;
        // But careful: This approach works for unary operators that apply to the entire primary, but what about parentheses? For example, "- (2+3)" => sign -1 times (2+3) = -5. That's fine.
        // However, what about "- 2 * 3"? According to precedence, unary minus has higher precedence than multiplication, so "-2*3" should be (-2)*3 = -6. In our grammar, parseFactor would consume the unary minus and then parse the primary, which would be the number 2, then after returning to parseTerm, the multiplication would be applied to that factor. That's correct.
        // But what about "- 2 + 3"? That would be (-2)+3 = 1. That's also correct.
        // However, there is a nuance: In some languages, unary minus has higher precedence than multiplication, but the expression "-2*3" is parsed as (-2)*3. That's what we have.
        // So the approach of accumulating sign and then multiplying the primary value works.
        // But we need to be careful: The unary operator applies to the factor, which could be a number or a parenthesized expression. So yes, we can accumulate sign.
        // However, consider expression: "3 * - 2". The factor for the second operand of multiplication is "-2". In parseFactor, we will see '-' and set sign = -1, then parse primary which is 2, return -2. Then multiplication yields 3 * -2 = -6. Good.
        // What about "- - 5"? Two unary minuses: sign becomes 1 after two flips? Actually, start sign=1, first '-' -> sign = -1, second '-' -> sign = 1, then parse primary 5 => 5. So result 5, which is correct: -(-5)=5.
        // So that works.
        // But we must also consider that unary plus is allowed: "+5" => 5, "+ -5" => -5, etc.
        // So we can implement parseFactor as:
        //   let sign = 1;
        //   while (currentToken === '+' || currentToken === '-') {
        //     if (currentToken === '-') sign = -sign;
        //     advance();
        //   }
        //   return sign * parsePrimary();
        // However, there is a catch: In some expressions, a unary operator may be followed by a factor that itself starts with a unary operator, but our while loop will consume all unary operators before parsing primary. That's fine.
        // But what about the case where there is no unary operator? Then while loop doesn't run, sign=1, parsePrimary returns number or parenthesized expression.
        // So that seems okay.
        // However, we need to ensure that we don't consume unary operators that belong to a different context? For example, in "3 - -2", the second '-' is unary. In parseTerm, after parsing left factor (3), we see '-' and treat as binary subtraction. Then we call parseFactor for the right operand. In parseFactor, we will see '-' and treat as unary, set sign = -1, then parse primary 2, return -2. Then subtraction: 3 - (-2) = 5. That's correct.
        // So the grammar works.
        // But we need to be careful about the tokenization: We'll need a tokenizer that splits the expression into tokens: numbers, operators, parentheses, spaces ignored.
        // We'll have a list of tokens, and a current index.
        // Tokens can be: NUM (string representing integer), '+', '-', '*', '/', '(', ')'.
        // Note: The unary plus and minus are same token as binary operators, but context determines meaning.
        // In our recursive descent, we rely on the fact that in parseFactor we consume any leading unary operators. In parseTerm and parseExpr, we treat '+' and '-' as binary operators only when they appear between factors. But our parseFactor will not consume a '+' or '-' if it's not at the beginning of a factor? Actually, in parseFactor, we are called from parseTerm or parseExpr? parseTerm calls parseFactor. In parseTerm, after parsing left factor, we check if current token is '*' or '/' to continue multiplication/division. If not, we return left. So if we have "3 + 4", parseTerm will parse left factor as 3, then sees '+', which is not '*' or '/', so returns 3. Then parseExpr sees '+' and calls parseTerm for right operand, which will parse factor starting at '+'. In that parseFactor, the while loop will see '+' and treat as unary plus, set sign=1 (unchanged), advance, then parse primary which is 4, return 4. Then addition yields 7. That's correct.
        // But what about "3 * + 4"? parseTerm left factor 3, then sees '*', so calls parseFactor for right operand. In parseFactor, while loop sees '+', treats as unary plus, sign=1, advance, then parse primary 4 => 4, return 4. Then multiplication 3*4=12. That's correct.
        // So it's fine.
        // However, there is a subtle issue: In some expressions, a unary operator may be followed by a number that is negative? But numbers are positive integers only; negative numbers are not represented as a single token; they are represented as unary minus applied to a number. So we don't have negative number tokens. That's fine.
        // So the recursive descent parser with the above design should work.
        // But we must also consider that the input may contain spaces; we'll ignore them.
        // We'll need to parse numbers: integers, possibly large, but within safe integer range. We'll parse them as numbers (JavaScript numbers). We'll convert from string to Number using Number(token) or parseInt.
        // We'll also need to handle the case where there might be no token left; but we assume valid expression.
        // Let's outline steps:
        // 1. Read input line: const input = fs.readFileSync(0, 'utf8').trim(); // trim to remove newline
        // 2. Tokenize: iterate over characters, skip spaces, collect digits into number tokens, otherwise treat each operator or parenthesis as a token.
        // 3. Set up a parser with tokens array, index.
        // 4. Parse expression: result = parseExpr();
        // 5. Output result as integer (maybe using Math.trunc or just toString). Since all intermediate values are safe integers, the result should be integer.
        // But note: In JavaScript, numbers are floats; when we output, we need to output integer without decimal point. We can use Math.trunc to ensure, but if it's integer, it will be like 42.0? Actually, if it's integer, it will be like 42. But if due to division we got a float, we need to truncate. However, our division operation should already truncate. So the result should be integer.
        // We'll implement division as: function div(a, b) { return Math.trunc(a / b); }
        // But careful: In JavaScript, division of two integers yields a float; Math.trunc will convert to integer. However, if a and b are both safe integers, the quotient might be safe integer but the float representation might be exact if the quotient is integer; if not integer, Math.trunc will give integer. But is there any risk of floating-point error causing off-by-one? For example, 1 / 3 = 0.333..., Math.trunc gives 0, correct. For negative, -1/3 = -0.333..., Math.trunc gives 0? Actually, Math.trunc(-0.333) = 0? No, Math.trunc truncates toward zero, so -0.333 becomes 0? Wait, truncation toward zero means remove fractional part, so -0.333 becomes 0? That's not correct: -0.333 truncated toward zero is 0? Actually, truncation toward zero means you take the integer part, discarding fractional part. For -0.333, the integer part is 0? The integer part of -0.333 is -0? Typically, integer part is floor for positive, but truncation toward zero means you move toward zero. For -0.333, moving toward zero gives 0? Let's think: In many programming languages, integer division truncates toward zero. For example, in C, -1/3 = 0. So yes, -0.333 truncated toward zero is 0. So Math.trunc(-0.333) = 0? Math.trunc(-0.333) returns -0? Actually, Math.trunc(-0.333) returns -0? No, Math.trunc returns the integer part of the number, removing any fractional digits. For -0.333, the integer part is 0? Wait, the integer part of -0.333 is -0? The concept of integer part is ambiguous. In JavaScript, Math.trunc(-0.333) returns -0? Let's test mentally: Math.trunc(3.7) = 3, Math.trunc(-3.7) = -3. Because it truncates toward zero. So Math.trunc(-0.333) should be 0? Actually, -0.333 is between 0 and -1, truncating toward zero yields 0? Because 0 is closer to zero than -1? But the rule: remove fractional part, so -0.333 -> -0? But -0 is just 0. So yes, it returns 0. However, is that correct for integer division truncating toward zero? In C, -1/3 = 0, so yes. So Math.trunc works.
        // But there is a nuance: Math.trunc(-0.333) returns 0, but some might argue that -0 is not a thing; it's 0. So it's fine.
        // However, we need to be careful: In JavaScript, -0 exists but is equal to 0. So output 0 is fine.
        // So division: Math.trunc(a / b) is fine.
        // But we must ensure that we don't have division by zero; assume not.
        // Now, about unary plus: It doesn't change value, but we still treat it as unary operator that flips sign? Actually, unary plus does not flip sign; it just keeps sign. In our sign accumulation, we only flip on '-'. So that's fine.
        // But we must consider the case where there is a unary plus before a number, like "+5". Our while loop will see '+', sign remains 1, then parse primary 5, return 5. Good.
        // However, there is a subtlety: In some expressions, a unary operator may be followed by a factor that is not a simple primary but a parenthesized expression. That's fine.
        // But what about the case where there is a unary operator after a left parenthesis? For example, "(-5)" -> parsePrimary sees '(' then calls parseExpr, then after parseExpr returns, we have the value, then we return sign * value? Actually, in our parseFactor, after consuming unary operators, we call parsePrimary. parsePrimary will see '(' and call parseExpr, then expect ')', then return the value. Then we multiply by sign. So that works.
        // However, consider " - (2+3) * 4". In parseFactor, we see '-', sign = -1, then parsePrimary sees '(' and returns 5, then factor returns -5. Then parseTerm will see '*' and multiply by 4, giving -20. That's correct.
        // So the parser seems sound.
        // But we must be careful about the precedence of unary operators relative to multiplication. In our grammar, factor consumes unary operators and then primary. That means unary operators bind tighter than multiplication, which is correct.
        // However, there is a potential issue: In some languages, unary minus has lower precedence than exponentiation, but we don't have exponentiation. So it's fine.
        // Let's test some cases mentally:
        // "3 + 4 * 2" -> parseExpr: left = parseTerm -> parseFactor -> parsePrimary returns 3. parseTerm sees '*'? no, returns 3. Then parseExpr sees '+', op='+', right = parseTerm -> parseFactor -> parsePrimary returns 4. parseTerm sees '*'? yes, so left=4, op='*', advance, right=parseFactor -> parsePrimary returns 2, left = 4*2=8. Then parseTerm returns 8. Then addition: 3+8=11. Good.
        // "3 * 4 + 2" -> parseExpr: left = parseTerm -> parseFactor returns 3, then sees '*', so left=3, op='*', advance, right=parseFactor -> parsePrimary returns 4, left=12. Then parseTerm returns 12. Then parseExpr sees '+', op='+', right = parseTerm -> parseFactor returns 2, no '*' so returns 2. Then addition: 12+2=14. Good.
        // "-3 * 4" -> parseExpr: left = parseTerm -> parseFactor: sees '-', sign=-1, then parsePrimary returns 3, factor returns -3. parseTerm sees '*'? yes, so left=-3, op='*', advance, right=parseFactor -> parsePrimary returns 4, left=-12. parseTerm returns -12. parseExpr returns -12. Good.
        // "3 * -4" -> parseExpr: left = parseTerm -> parseFactor returns 3. parseTerm sees '*', so left=3, op='*', advance, right=parseFactor: sees '-', sign=-1, parsePrimary returns 4, factor returns -4. left=3*-4=-12. Good.
        // "3 - -4" -> parseExpr: left = parseTerm -> parseFactor returns 3. parseExpr sees '-', op='-', advance, right = parseTerm -> parseFactor: sees '-', sign=-1, parsePrimary returns 4, factor returns -4. parseTerm returns -4. Then left = 3 - (-4) = 7. Good.
        // "3 / -2" -> division truncating toward zero: 3 / -2 = -1.5, trunc -> -1? Actually, truncation toward zero: 3 / -2 = -1.5, trunc to -1? Wait, -1.5 truncated toward zero is -1? Because moving toward zero from -1.5 gives -1? Actually, truncation toward zero means remove fractional part, so -1.5 becomes -1? Let's think: For positive numbers, truncation removes fractional part, e.g., 1.5 -> 1. For negative numbers, truncation also removes fractional part, but the integer part is the number without fractional part, which for -1.5 is -1? The integer part of -1.5 is -1? Actually, the integer part is the number without the fractional part, but the sign is attached. Typically, the integer part of -1.5 is -1? Let's check: In C, integer division truncates toward zero: -3 / 2 = -1. So -1.5 becomes -1. So yes, truncation toward zero yields -1. So 3 / -2 = -1. Our Math.trunc(3 / -2) = Math.trunc(-1.5) = -1. Good.
        // "-3 / 2" = -1.5 -> -1. Good.
        // "-3 / -2" = 1.5 -> 1. Good.
        // So division works.
        // Now, what about nested parentheses: "((2+3)*4)" -> parseFactor: no unary, parsePrimary sees '(' then parseExpr, etc.
        // So it's fine.
        // But we need to handle the case where there is no token left after parsing, but we assume valid expression.
        // Now, tokenization: We'll parse the string character by character.
        // We'll define Token type: { type: 'NUM' | 'OP' | 'LPAREN' | 'RPAREN', value?: string } but we can just store strings.
        // Actually, we can store tokens as strings: "NUM", "+", "-", "*", "/", "(", ")" but for numbers we need the numeric value. We can store as object: { type: 'NUM', value: number } or just store as number and operators as strings. But for simplicity, we can store tokens as strings for operators and numbers as strings, then parse numbers when needed.
        // We'll have a token list: each token is either a string for operator/paren or a number for numeric literal.
        // Implementation steps:
        // - Read input line, trim.
        // - Tokenize:
        //   let tokens = [];
        //   let i = 0;
        //   while (i < input.length) {
        //     let ch = input[i];
        //     if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { i++; continue; }
        //     if (/\d/.test(ch)) {
        //       let start = i;
        //       while (i < input.length && /\d/.test(input[i])) { i++; }
        //       tokens.push(Number(input.slice(start, i))); // number
        //     } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
        //       tokens.push(ch);
        //       i++;
        //     } else {
        //       // maybe ignore or error; but assume valid input.
        //       i++;
        //     }
        //   }
        // - Then set up parser with tokens, index.
        // - Implement peek() and advance().
        // - Implement parseExpr, parseTerm, parseFactor, parsePrimary.
        // - In parseFactor, we need to handle unary operators. But careful: In our design, parseFactor will consume any leading '+' or '-' and then call parsePrimary. However, we must ensure that when we are in parseFactor, we don't accidentally consume a '+' or '-' that is actually binary? But parseFactor is called only when we expect a factor, i.e., after an operator or at the start. At those points, any '+' or '-' is unary. So it's safe.
        // - However, there is a nuance: In parseTerm, after parsing left factor, we check if current token is '*' or '/'. If not, we return. So if the next token is '+' or '-', we don't consume it in parseTerm; it will be handled by parseExpr. So that's fine.
        // - In parseExpr, after parsing left term, we check if current token is '+' or '-'. If so, we consume and call parseTerm for right operand. That's fine.
        // - In parsePrimary, we handle numbers and parentheses.
        // - In parsePrimary, if current token is a number, we consume and return it. If it's '(' we consume, call parseExpr, then expect ')', consume, and return the result.
        // - We need to ensure that we don't have extra tokens after parsing; but we assume expression covers entire input.
        // - Output: console.log(result) or process.stdout.write.
        // Now, we need to be careful about integer overflow? The problem says all intermediate values fit in JavaScript safe integers, so no overflow.
        // But we need to implement division truncating toward zero. In JavaScript, division of two integers yields a float; Math.trunc will produce integer. However, if the division result is not an integer, Math.trunc will give integer. But what about the case where a / b is exactly representable as a double but not integer? That's fine.
        // But there is a potential issue: In JavaScript, division of two large integers might lose precision because the quotient might be beyond safe integer range? But the problem says intermediate values fit in safe integers, so the result of division should also be safe integer. So it's fine.
        // However, we should be careful: When we compute a / b, if a and b are both safe integers, the result might be a float that is not exactly representable, but the integer part after truncation should be correct. There might be edge cases where the floating-point division yields a value slightly less than the true integer quotient due to rounding, causing truncation to give one less. For example, suppose a = 1, b = 3, true quotient 0.333..., double representation is 0.3333333333333333, Math.trunc gives 0, correct. For a = 7, b = 3, 7/3 = 2.333..., double is 2.3333333333333335, Math.trunc gives 2, correct. For a = -7, b = 3, -7/3 = -2.333..., double is -2.3333333333333335, Math.trunc gives -2, correct. So it's fine.
        // But what about a = 2^53 - 1, b = 1? That's safe. a / b = a, which is safe integer, double representation is exact. So fine.
        // So Math.trunc is okay.
        // Alternatively, we could implement integer division using Math.sign and Math.floor on absolute values: q = Math.trunc(a / b) is simpler.
        // Now, we need to ensure that we output the integer without decimal point. If the result is integer, it will be printed as integer. If it's a float due to division, we already truncated, so it's integer.
        // But note: In JavaScript, numbers are always floats; when you print a number that is an integer, it prints without decimal if it's within safe integer? Actually, console.log(42) prints "42". console.log(42.0) prints "42"? It prints "42" as well because JavaScript doesn't differentiate. So fine.
        // Now, we need to write TypeScript code. We'll define types for tokens maybe.
        // Let's write the code.
        // We'll create a class Parser or just functions with closure.
        // We'll use a global tokens array and index, but better to encapsulate.
        // I'll write a class Evaluator with tokenize and parse methods.
        // But the problem just requires a complete program, so we can do simple procedural.
        // Let's outline:
        // import fs from 'fs'; // but Node.js doesn't require import? In TypeScript, we need to use require or import. Since it's Node.js, we can use import fs from 'fs'; if using ES modules, but typical Node.js scripts use require. However, the problem says "TypeScript program for Node.js". We can use ES module syntax with import. But to be safe, we can use require('fs').readFileSync. Since it's TypeScript, we can declare import.
        // I'll use: import * as fs from 'fs'; or const fs = require('fs'); The latter is CommonJS, but TypeScript can handle both. I'll use import fs from 'fs'; with default import? Actually, fs is a module with named exports. So we can do: import fs from 'fs'; but that might not work because fs doesn't have a default export. In Node.js, you can do import fs from 'fs'; because of interop, but it's better to use import * as fs from 'fs';. I'll use: import * as fs from 'fs';
        // Then: const input = fs.readFileSync(0, 'utf8').trim();
        // Tokenize.
        // Parse.
        // Output.
        // Let's code.
        // We'll define Token type: interface Token { type: 'NUM' | 'OP' | 'LPAREN' | 'RPAREN'; value?: string | number; } but we can just use string/number.
        // Actually, we can store tokens as: type Token = number | '+' | '-' | '*' | '/' | '(' | ')'; but that's not a union of literal types. We can define type Operator = '+' | '-' | '*' | '/'; type Paren = '(' | ')'; type Token = number | Operator | Paren; but then we need to differentiate numbers from operators. We can check typeof token ===
    }
    // The unary operator applies to the following factor
    // We need to get the value of the factor and then apply sign
    // But careful: if we have multiple unary operators like "--5", we need to parse recursively.
    // So we can parse the factor recursively, then apply sign.
    // However, if we do a while loop, we need to combine signs. For example, "- -5" => unary minus then unary minus then 5. The value is (-(-5)) = 5.
    // We can accumulate sign: start with 1, for each unary minus, flip sign; for unary plus, no change.
    // But we must parse the factor after the unary operators, which could be a number or parentheses.
    // So we can do:
    // let sign = 1;
    // while (currentToken is '+' or '-') {
    //   if (currentToken === '-') sign = -sign;
    //   advance();
    // }
    // let value = parsePrimary();
    // return sign * value;
    // But careful: This approach works for unary operators that apply to the entire primary, but what about parentheses? For example, "- (2+3)" => sign -1 times (2+3) = -5. That's fine.
    // However, what about "- 2 * 3"? According to precedence, unary minus has higher precedence than multiplication, so "-2*3" should be (-2)*3 = -6. In our grammar, parseFactor would consume the unary minus and then parse the primary, which would be the number 2, then after returning to parseTerm, the multiplication would be applied to that factor. That's correct.
    // But what about "- 2 + 3"? That would be (-2)+3 = 1. That's also correct.
    // However, there is a nuance: In some languages, unary minus has higher precedence than multiplication, but the expression "-2*3" is parsed as (-2)*3. That's what we have.
    // So the approach of accumulating sign and then multiplying the primary value works.
    // But we need to be careful: The unary operator applies to the factor, which could be a number or a parenthesized expression. So yes, we can accumulate sign.
    // However, consider expression: "3 * - 2". The factor for the second operand of multiplication is "-2". In parseFactor, we will see '-' and set sign = -1, then parse primary which is 2, return -2. Then multiplication yields 3 * -2 = -6. Good.
    // What about "- - 5"? Two unary minuses: sign becomes 1 after two flips? Actually, start sign=1, first '-' -> sign = -1, second '-' -> sign = 1, then parse primary 5 => 5. So result 5, which is correct: -(-5)=5.
    // So that works.
    // But we must also consider that unary plus is allowed: "+5" => 5, "+ -5" => -5, etc.
    // So we can implement parseFactor as:
    //   let sign = 1;
    //   while (currentToken === '+' || currentToken === '-') {
    //     if (currentToken === '-') sign = -sign;
    //     advance();
    //   }
    //   return sign * parsePrimary();
    // However, there is a catch: In some expressions, a unary operator may be followed by a factor that itself starts with a unary operator, but our while loop will consume all unary operators before parsing primary. That's fine.
    // But what about the case where there is no unary operator? Then while loop doesn't run, sign=1, parsePrimary returns number or parenthesized expression.
    // So that seems okay.
    // However, we need to ensure that we don't consume unary operators that belong to a different context? For example, in "3 - -2", the second '-' is unary. In parseTerm, after parsing left factor (3), we see '-' and treat as binary subtraction. Then we call parseFactor for the right operand. In parseFactor, we will see '-' and treat as unary, set sign = -1, then parse primary 2, return -2. Then subtraction: 3 - (-2) = 5. That's correct.
    // So the grammar works.
    // But we need to be careful about the tokenization: We'll need a tokenizer that splits the expression into tokens: numbers, operators, parentheses, spaces ignored.
    // We'll have a list of tokens, and a current index.
    // Tokens can be: NUM (string representing integer), '+', '-', '*', '/', '(', ')'.
    // Note: The unary plus and minus are same token as binary operators, but context determines meaning.
    // In our recursive descent, we rely on the fact that in parseFactor we consume any leading unary operators. In parseTerm and parseExpr, we treat '+' and '-' as binary operators only when they appear between factors. But our parseFactor will not consume a '+' or '-' if it's not at the beginning of a factor? Actually, in parseFactor, we are called from parseTerm or parseExpr? parseTerm calls parseFactor. In parseTerm, after parsing left factor, we check if current token is '*' or '/' to continue multiplication/division. If not, we return left. So if we have "3 + 4", parseTerm will parse left factor as 3, then sees '+', which is not '*' or '/', so returns 3. Then parseExpr sees '+' and calls parseTerm for right operand, which will parse factor starting at '+'. In that parseFactor, the while loop will see '+' and treat as unary plus, set sign=1 (unchanged), advance, then parse primary which is 4, return 4. Then addition yields 7. That's correct.
    // But what about "3 * + 4"? parseTerm left factor 3, then sees '*', so calls parseFactor for right operand. In parseFactor, while loop sees '+', treats as unary plus, sign=1, advance, then parse primary 4 => 4, return 4. Then multiplication 3*4=12. That's correct.
    // So it's fine.
    // However, there is a subtle issue: In some expressions, a unary operator may be followed by a number that is negative? But numbers are positive integers only; negative numbers are not represented as a single token; they are represented as unary minus applied to a number. So we don't have negative number tokens. That's fine.
    // So the recursive descent parser with the above design should work.
    // But we must also consider that the input may contain spaces; we'll ignore them.
    // We'll need to parse numbers: integers, possibly large, but within safe integer range. We'll parse them as numbers (JavaScript numbers). We'll convert from string to Number using Number(token) or parseInt.
    // We'll also need to handle the case where there might be no token left; but we assume valid expression.
    // Let's outline steps:
    // 1. Read input line: const input = fs.readFileSync(0, 'utf8').trim(); // trim to remove newline
    // 2. Tokenize: iterate over characters, skip spaces, collect digits into number tokens, otherwise treat each operator or parenthesis as a token.
    // 3. Set up a parser with tokens array, index.
    // 4. Parse expression: result = parseExpr();
    // 5. Output result as integer (maybe using Math.trunc or just toString). Since all intermediate values are safe integers, the result should be integer.
    // But note: In JavaScript, numbers are floats; when we output, we need to output integer without decimal point. We can use Math.trunc to ensure, but if it's integer, it will be like 42.0? Actually, if it's integer, it will be like 42. But if due to division we got a float, we need to truncate. However, our division operation should already truncate. So the result should be integer.
    // We'll implement division as: function div(a, b) { return Math.trunc(a / b); }
    // But careful: In JavaScript, division of two integers yields a float; Math.trunc will convert to integer. However, if a and b are both safe integers, the quotient might be safe integer but the float representation might be exact if the quotient is integer; if not integer, Math.trunc will give integer. But is there any risk of floating-point error causing off-by-one? For example, 1 / 3 = 0.333..., Math.trunc gives 0, correct. For negative, -1/3 = -0.333..., Math.trunc gives 0? Actually, Math.trunc(-0.333) = 0? No, Math.trunc truncates toward zero, so -0.333 becomes 0? Wait, truncation toward zero means remove fractional part, so -0.333 becomes 0? That's not correct: -0.333 truncated toward zero is 0? Actually, truncation toward zero means you take the integer part, discarding fractional part. For -0.333, the integer part is 0? The integer part of -0.333 is -0? Typically, integer part is floor for positive, but truncation toward zero means you move toward zero. For -0.333, moving toward zero gives 0? Let's think: In many programming languages, integer division truncates toward zero. For example, in C, -1/3 = 0. So yes, -0.333 truncated toward zero is 0. So Math.trunc(-0.333) = 0? Math.trunc(-0.333) returns -0? Actually, Math.trunc(-0.333) returns -0? No, Math.trunc returns the integer part of the number, removing any fractional digits. For -0.333, the integer part is 0? Wait, the integer part of -0.333 is -0? The concept of integer part is ambiguous. In JavaScript, Math.trunc(-0.333) returns -0? Let's test mentally: Math.trunc(3.7) = 3, Math.trunc(-3.7) = -3. Because it truncates toward zero. So Math.trunc(-0.333) should be 0? Actually, -0.333 is between 0 and -1, truncating toward zero yields 0? Because 0 is closer to zero than -1? But the rule: remove fractional part, so -0.333 -> -0? But -0 is just 0. So yes, it returns 0. However, is that correct for integer division truncating toward zero? In C, -1/3 = 0, so yes. So Math.trunc works.
    // But there is a nuance: Math.trunc(-0.333) returns 0, but some might argue that -0 is not a thing; it's 0. So it's fine.
    // However, we need to be careful: In JavaScript, -0 exists but is equal to 0. So output 0 is fine.
    // So division: Math.trunc(a / b) is fine.
    // But we must ensure that we don't have division by zero; assume not.
    // Now, about unary plus: It doesn't change value, but we still treat it as unary operator that flips sign? Actually, unary plus does not flip sign; it just keeps sign. In our sign accumulation, we only flip on '-'. So that's fine.
    // But we must consider the case where there is a unary plus before a number, like "+5". Our while loop will see '+', sign remains 1, then parse primary 5, return 5. Good.
    // However, there is a subtlety: In some expressions, a unary operator may be followed by a factor that is not a simple primary but a parenthesized expression. That's fine.
    // But what about the case where there is a unary operator after a left parenthesis? For example, "(-5)" -> parsePrimary sees '(' then calls parseExpr, then after parseExpr returns, we have the value, then we return sign * value? Actually, in our parseFactor, after consuming unary operators, we call parsePrimary. parsePrimary will see '(' and call parseExpr, then expect ')', then return the value. Then we multiply by sign. So that works.
    // However, consider " - (2+3) * 4". In parseFactor, we see '-', sign = -1, then parsePrimary sees '(' and returns 5, then factor returns -5. Then parseTerm will see '*' and multiply by 4, giving -20. That's correct.
    // So the parser seems sound.
    // But we must be careful about the precedence of unary operators relative to multiplication. In our grammar, factor consumes unary operators and then primary. That means unary operators bind tighter than multiplication, which is correct.
    // However, there is a potential issue: In some languages, unary minus has lower precedence than exponentiation, but we don't have exponentiation. So it's fine.
    // Let's test some cases mentally:
    // "3 + 4 * 2" -> parseExpr: left = parseTerm -> parseFactor -> parsePrimary returns 3. parseTerm sees '*'? no, returns 3. Then parseExpr sees '+', op='+', right = parseTerm -> parseFactor -> parsePrimary returns 4. parseTerm sees '*'? yes, so left=4, op='*', advance, right=parseFactor -> parsePrimary returns 2, left = 4*2=8. Then parseTerm returns 8. Then addition: 3+8=11. Good.
    // "3 * 4 + 2" -> parseExpr: left = parseTerm -> parseFactor returns 3, then sees '*', so left=3, op='*', advance, right=parseFactor -> parsePrimary returns 4, left=12. Then parseTerm returns 12. Then parseExpr sees '+', op='+', right = parseTerm -> parseFactor returns 2, no '*' so returns 2. Then addition: 12+2=14. Good.
    // "-3 * 4" -> parseExpr: left = parseTerm -> parseFactor: sees '-', sign=-1, then parsePrimary returns 3, factor returns -3. parseTerm sees '*'? yes, so left=-3, op='*', advance, right=parseFactor -> parsePrimary returns 4, left=-12. parseTerm returns -12. parseExpr returns -12. Good.
    // "3 * -4" -> parseExpr: left = parseTerm -> parseFactor returns 3. parseTerm sees '*', so left=3, op='*', advance, right=parseFactor: sees '-', sign=-1, parsePrimary returns 4, factor returns -4. left=3*-4=-12. Good.
    // "3 - -4" -> parseExpr: left = parseTerm -> parseFactor returns 3. parseExpr sees '-', op='-', advance, right = parseTerm -> parseFactor: sees '-', sign=-1, parsePrimary returns 4, factor returns -4. parseTerm returns -4. Then left = 3 - (-4) = 7. Good.
    // "3 / -2" -> division truncating toward zero: 3 / -2 = -1.5, trunc -> -1? Actually, truncation toward zero: 3 / -2 = -1.5, trunc to -1? Wait, -1.5 truncated toward zero is -1? Because moving toward zero from -1.5 gives -1? Actually, truncation toward zero means remove fractional part, so -1.5 becomes -1? Let's think: For positive numbers, truncation removes fractional part, e.g., 1.5 -> 1. For negative numbers, truncation also removes fractional part, but the integer part is the number without fractional part, which for -1.5 is -1? The integer part of -1.5 is -1? Actually, the integer part is the number without the fractional part, but the sign is attached. Typically, the integer part of -1.5 is -1? Let's check: In C, integer division truncates toward zero: -3 / 2 = -1. So -1.5 becomes -1. So yes, truncation toward zero yields -1. So 3 / -2 = -1. Our Math.trunc(3 / -2) = Math.trunc(-1.5) = -1. Good.
    // "-3 / 2" = -1.5 -> -1. Good.
    // "-3 / -2" = 1.5 -> 1. Good.
    // So division works.
    // Now, what about nested parentheses: "((2+3)*4)" -> parseFactor: no unary, parsePrimary sees '(' then parseExpr, etc.
    // So it's fine.
    // But we need to handle the case where there is no token left after parsing, but we assume valid expression.
    // Now, tokenization: We'll parse the string character by character.
    // We'll define Token type: { type: 'NUM' | 'OP' | 'LPAREN' | 'RPAREN', value?: string } but we can just store strings.
    // Actually, we can store tokens as strings: "NUM", "+", "-", "*", "/", "(", ")" but for numbers we need the numeric value. We can store as object: { type: 'NUM', value: number } or just store as number and operators as strings. But for simplicity, we can store tokens as strings for operators and numbers as strings, then parse numbers when needed.
    // We'll have a token list: each token is either a string for operator/paren or a number for numeric literal.
    // Implementation steps:
    // - Read input line, trim.
    // - Tokenize:
    //   let tokens = [];
    //   let i = 0;
    //   while (i < input.length) {
    //     let ch = input[i];
    //     if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { i++; continue; }
    //     if (/\d/.test(ch)) {
    //       let start = i;
    //       while (i < input.length && /\d/.test(input[i])) { i++; }
    //       tokens.push(Number(input.slice(start, i))); // number
    //     } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
    //       tokens.push(ch);
    //       i++;
    //     } else {
    //       // maybe ignore or error; but assume valid input.
    //       i++;
    //     }
    //   }
    // - Then set up parser with tokens, index.
    // - Implement peek() and advance().
    // - Implement parseExpr, parseTerm, parseFactor, parsePrimary.
    // - In parseFactor, we need to handle unary operators. But careful: In our design, parseFactor will consume any leading '+' or '-' and then call parsePrimary. However, we must ensure that when we are in parseFactor, we don't accidentally consume a '+' or '-' that is actually binary? But parseFactor is called only when we expect a factor, i.e., after an operator or at the start. At those points, any '+' or '-' is unary. So it's safe.
    // - However, there is a nuance: In parseTerm, after parsing left factor, we check if current token is '*' or '/'. If not, we return. So if the next token is '+' or '-', we don't consume it in parseTerm; it will be handled by parseExpr. So that's fine.
    // - In parseExpr, after parsing left term, we check if current token is '+' or '-'. If so, we consume and call parseTerm for right operand. That's fine.
    // - In parsePrimary, we handle numbers and parentheses.
    // - In parsePrimary, if current token is a number, we consume and return it. If it's '(' we consume, call parseExpr, then expect ')', consume, and return the result.
    // - We need to ensure that we don't have extra tokens after parsing; but we assume expression covers entire input.
    // - Output: console.log(result) or process.stdout.write.
    // Now, we need to be careful about integer overflow? The problem says all intermediate values fit in JavaScript safe integers, so no overflow.
    // But we need to implement division truncating toward zero. In JavaScript, division of two integers yields a float; Math.trunc will produce integer. However, if the division result is not an integer, Math.trunc will give integer. But what about the case where a / b is exactly representable as a double but not integer? That's fine.
    // But there is a potential issue: In JavaScript, division of two large integers might lose precision because the quotient might be beyond safe integer range? But the problem says intermediate values fit in safe integers, so the result of division should also be safe integer. So it's fine.
    // However, we should be careful: When we compute a / b, if a and b are both safe integers, the result might be a float that is not exactly representable, but the integer part after truncation should be correct. There might be edge cases where the floating-point division yields a value slightly less than the true integer quotient due to rounding, causing truncation to give one less. For example, suppose a = 1, b = 3, true quotient 0.333..., double representation is 0.3333333333333333, Math.trunc gives 0, correct. For a = 7, b = 3, 7/3 = 2.333..., double is 2.3333333333333335, Math.trunc gives 2, correct. For a = -7, b = 3, -7/3 = -2.333..., double is -2.3333333333333335, Math.trunc gives -2, correct. So it's fine.
    // But what about a = 2^53 - 1, b = 1? That's safe. a / b = a, which is safe integer, double representation is exact. So fine.
    // So Math.trunc is okay.
    // Alternatively, we could implement integer division using Math.sign and Math.floor on absolute values: q = Math.trunc(a / b) is simpler.
    // Now, we need to ensure that we output the integer without decimal point. If the result is integer, it will be printed as integer. If it's a float due to division, we already truncated, so it's integer.
    // But note: In JavaScript, numbers are always floats; when you print a number that is an integer, it prints without decimal if it's within safe integer? Actually, console.log(42) prints "42". console.log(42.0) prints "42"? It prints "42" as well because JavaScript doesn't differentiate. So fine.
    // Now, we need to write TypeScript code. We'll define types for tokens maybe.
    // Let's write the code.
    // We'll create a class Parser or just functions with closure.
    // We'll use a global tokens array and index, but better to encapsulate.
    // I'll write a class Evaluator with tokenize and parse methods.
    // But the problem just requires a complete program, so we can do simple procedural.
    // Let's outline:
    // import fs from 'fs'; // but Node.js doesn't require import? In TypeScript, we need to use require or import. Since it's Node.js, we can use import fs from 'fs'; if using ES modules, but typical Node.js scripts use require. However, the problem says "TypeScript program for Node.js". We can use ES module syntax with import. But to be safe, we can use require('fs').readFileSync. Since it's TypeScript, we can declare import.
    // I'll use: import * as fs from 'fs'; or const fs = require('fs'); The latter is CommonJS, but TypeScript can handle both. I'll use import fs from 'fs'; with default import? Actually, fs is a module with named exports. So we can do: import fs from 'fs'; but that might not work because fs doesn't have a default export. In Node.js, you can do import fs from 'fs'; because of interop, but it's better to use import * as fs from 'fs';. I'll use: import * as fs from 'fs';
    // Then: const input = fs.readFileSync(0, 'utf8').trim();
    // Tokenize.
    // Parse.
    // Output.
    // Let's code.
    // We'll define Token type: interface Token { type: 'NUM' | 'OP' | 'LPAREN' | 'RPAREN'; value?: string | number; } but we can just use string/number.
    // Actually, we can store tokens as: type Token = number | '+' | '-' | '*' | '/' | '(' | ')'; but that's not a union of literal types. We can define type Operator = '+' | '-' | '*' | '/'; type Paren = '(' | ')'; type Token = number | Operator | Paren; but then we need to differentiate numbers from operators. We can check typeof token ===
}
// The unary operator applies to the following factor
// We need to get the value of the factor and then apply sign
// But careful: if we have multiple unary operators like "--5", we need to parse recursively.
// So we can parse the factor recursively, then apply sign.
// However, if we do a while loop, we need to combine signs. For example, "- -5" => unary minus then unary minus then 5. The value is (-(-5)) = 5.
// We can accumulate sign: start with 1, for each unary minus, flip sign; for unary plus, no change.
// But we must parse the factor after the unary operators, which could be a number or parentheses.
// So we can do:
// let sign = 1;
// while (currentToken is '+' or '-') {
//   if (currentToken === '-') sign = -sign;
//   advance();
// }
// let value = parsePrimary();
// return sign * value;
// But careful: This approach works for unary operators that apply to the entire primary, but what about parentheses? For example, "- (2+3)" => sign -1 times (2+3) = -5. That's fine.
// However, what about "- 2 * 3"? According to precedence, unary minus has higher precedence than multiplication, so "-2*3" should be (-2)*3 = -6. In our grammar, parseFactor would consume the unary minus and then parse the primary, which would be the number 2, then after returning to parseTerm, the multiplication would be applied to that factor. That's correct.
// But what about "- 2 + 3"? That would be (-2)+3 = 1. That's also correct.
// However, there is a nuance: In some languages, unary minus has higher precedence than multiplication, but the expression "-2*3" is parsed as (-2)*3. That's what we have.
// So the approach of accumulating sign and then multiplying the primary value works.
// But we need to be careful: The unary operator applies to the factor, which could be a number or a parenthesized expression. So yes, we can accumulate sign.
// However, consider expression: "3 * - 2". The factor for the second operand of multiplication is "-2". In parseFactor, we will see '-' and set sign = -1, then parse primary which is 2, return -2. Then multiplication yields 3 * -2 = -6. Good.
// What about "- - 5"? Two unary minuses: sign becomes 1 after two flips? Actually, start sign=1, first '-' -> sign = -1, second '-' -> sign = 1, then parse primary 5 => 5. So result 5, which is correct: -(-5)=5.
// So that works.
// But we must also consider that unary plus is allowed: "+5" => 5, "+ -5" => -5, etc.
// So we can implement parseFactor as:
//   let sign = 1;
//   while (currentToken === '+' || currentToken === '-') {
//     if (currentToken === '-') sign = -sign;
//     advance();
//   }
//   return sign * parsePrimary();
// However, there is a catch: In some expressions, a unary operator may be followed by a factor that itself starts with a unary operator, but our while loop will consume all unary operators before parsing primary. That's fine.
// But what about the case where there is no unary operator? Then while loop doesn't run, sign=1, parsePrimary returns number or parenthesized expression.
// So that seems okay.
// However, we need to ensure that we don't consume unary operators that belong to a different context? For example, in "3 - -2", the second '-' is unary. In parseTerm, after parsing left factor (3), we see '-' and treat as binary subtraction. Then we call parseFactor for the right operand. In parseFactor, we will see '-' and treat as unary, set sign = -1, then parse primary 2, return -2. Then subtraction: 3 - (-2) = 5. That's correct.
// So the grammar works.
// But we need to be careful about the tokenization: We'll need a tokenizer that splits the expression into tokens: numbers, operators, parentheses, spaces ignored.
// We'll have a list of tokens, and a current index.
// Tokens can be: NUM (string representing integer), '+', '-', '*', '/', '(', ')'.
// Note: The unary plus and minus are same token as binary operators, but context determines meaning.
// In our recursive descent, we rely on the fact that in parseFactor we consume any leading unary operators. In parseTerm and parseExpr, we treat '+' and '-' as binary operators only when they appear between factors. But our parseFactor will not consume a '+' or '-' if it's not at the beginning of a factor? Actually, in parseFactor, we are called from parseTerm or parseExpr? parseTerm calls parseFactor. In parseTerm, after parsing left factor, we check if current token is '*' or '/' to continue multiplication/division. If not, we return left. So if we have "3 + 4", parseTerm will parse left factor as 3, then sees '+', which is not '*' or '/', so returns 3. Then parseExpr sees '+' and calls parseTerm for right operand, which will parse factor starting at '+'. In that parseFactor, the while loop will see '+' and treat as unary plus, set sign=1 (unchanged), advance, then parse primary which is 4, return 4. Then addition yields 7. That's correct.
// But what about "3 * + 4"? parseTerm left factor 3, then sees '*', so calls parseFactor for right operand. In parseFactor, while loop sees '+', treats as unary plus, sign=1, advance, then parse primary 4 => 4, return 4. Then multiplication 3*4=12. That's correct.
// So it's fine.
// However, there is a subtle issue: In some expressions, a unary operator may be followed by a number that is negative? But numbers are positive integers only; negative numbers are not represented as a single token; they are represented as unary minus applied to a number. So we don't have negative number tokens. That's fine.
// So the recursive descent parser with the above design should work.
// But we must also consider that the input may contain spaces; we'll ignore them.
// We'll need to parse numbers: integers, possibly large, but within safe integer range. We'll parse them as numbers (JavaScript numbers). We'll convert from string to Number using Number(token) or parseInt.
// We'll also need to handle the case where there might be no token left; but we assume valid expression.
// Let's outline steps:
// 1. Read input line: const input = fs.readFileSync(0, 'utf8').trim(); // trim to remove newline
// 2. Tokenize: iterate over characters, skip spaces, collect digits into number tokens, otherwise treat each operator or parenthesis as a token.
// 3. Set up a parser with tokens array, index.
// 4. Parse expression: result = parseExpr();
// 5. Output result as integer (maybe using Math.trunc or just toString). Since all intermediate values are safe integers, the result should be integer.
// But note: In JavaScript, numbers are floats; when we output, we need to output integer without decimal point. We can use Math.trunc to ensure, but if it's integer, it will be like 42.0? Actually, if it's integer, it will be like 42. But if due to division we got a float, we need to truncate. However, our division operation should already truncate. So the result should be integer.
// We'll implement division as: function div(a, b) { return Math.trunc(a / b); }
// But careful: In JavaScript, division of two integers yields a float; Math.trunc will convert to integer. However, if a and b are both safe integers, the quotient might be safe integer but the float representation might be exact if the quotient is integer; if not integer, Math.trunc will give integer. But is there any risk of floating-point error causing off-by-one? For example, 1 / 3 = 0.333..., Math.trunc gives 0, correct. For negative, -1/3 = -0.333..., Math.trunc gives 0? Actually, Math.trunc(-0.333) = 0? No, Math.trunc truncates toward zero, so -0.333 becomes 0? Wait, truncation toward zero means remove fractional part, so -0.333 becomes 0? That's not correct: -0.333 truncated toward zero is 0? Actually, truncation toward zero means you take the integer part, discarding fractional part. For -0.333, the integer part is 0? The integer part of -0.333 is -0? Typically, integer part is floor for positive, but truncation toward zero means you move toward zero. For -0.333, moving toward zero gives 0? Let's think: In many programming languages, integer division truncates toward zero. For example, in C, -1/3 = 0. So yes, -0.333 truncated toward zero is 0. So Math.trunc(-0.333) = 0? Math.trunc(-0.333) returns -0? Actually, Math.trunc(-0.333) returns -0? No, Math.trunc returns the integer part of the number, removing any fractional digits. For -0.333, the integer part is 0? Wait, the integer part of -0.333 is -0? The concept of integer part is ambiguous. In JavaScript, Math.trunc(-0.333) returns -0? Let's test mentally: Math.trunc(3.7) = 3, Math.trunc(-3.7) = -3. Because it truncates toward zero. So Math.trunc(-0.333) should be 0? Actually, -0.333 is between 0 and -1, truncating toward zero yields 0? Because 0 is closer to zero than -1? But the rule: remove fractional part, so -0.333 -> -0? But -0 is just 0. So yes, it returns 0. However, is that correct for integer division truncating toward zero? In C, -1/3 = 0, so yes. So Math.trunc works.
// But there is a nuance: Math.trunc(-0.333) returns 0, but some might argue that -0 is not a thing; it's 0. So it's fine.
// However, we need to be careful: In JavaScript, -0 exists but is equal to 0. So output 0 is fine.
// So division: Math.trunc(a / b) is fine.
// But we must ensure that we don't have division by zero; assume not.
// Now, about unary plus: It doesn't change value, but we still treat it as unary operator that flips sign? Actually, unary plus does not flip sign; it just keeps sign. In our sign accumulation, we only flip on '-'. So that's fine.
// But we must consider the case where there is a unary plus before a number, like "+5". Our while loop will see '+', sign remains 1, then parse primary 5, return 5. Good.
// However, there is a subtlety: In some expressions, a unary operator may be followed by a factor that is not a simple primary but a parenthesized expression. That's fine.
// But what about the case where there is a unary operator after a left parenthesis? For example, "(-5)" -> parsePrimary sees '(' then calls parseExpr, then after parseExpr returns, we have the value, then we return sign * value? Actually, in our parseFactor, after consuming unary operators, we call parsePrimary. parsePrimary will see '(' and call parseExpr, then expect ')', then return the value. Then we multiply by sign. So that works.
// However, consider " - (2+3) * 4". In parseFactor, we see '-', sign = -1, then parsePrimary sees '(' and returns 5, then factor returns -5. Then parseTerm will see '*' and multiply by 4, giving -20. That's correct.
// So the parser seems sound.
// But we must be careful about the precedence of unary operators relative to multiplication. In our grammar, factor consumes unary operators and then primary. That means unary operators bind tighter than multiplication, which is correct.
// However, there is a potential issue: In some languages, unary minus has lower precedence than exponentiation, but we don't have exponentiation. So it's fine.
// Let's test some cases mentally:
// "3 + 4 * 2" -> parseExpr: left = parseTerm -> parseFactor -> parsePrimary returns 3. parseTerm sees '*'? no, returns 3. Then parseExpr sees '+', op='+', right = parseTerm -> parseFactor -> parsePrimary returns 4. parseTerm sees '*'? yes, so left=4, op='*', advance, right=parseFactor -> parsePrimary returns 2, left = 4*2=8. Then parseTerm returns 8. Then addition: 3+8=11. Good.
// "3 * 4 + 2" -> parseExpr: left = parseTerm -> parseFactor returns 3, then sees '*', so left=3, op='*', advance, right=parseFactor -> parsePrimary returns 4, left=12. Then parseTerm returns 12. Then parseExpr sees '+', op='+', right = parseTerm -> parseFactor returns 2, no '*' so returns 2. Then addition: 12+2=14. Good.
// "-3 * 4" -> parseExpr: left = parseTerm -> parseFactor: sees '-', sign=-1, then parsePrimary returns 3, factor returns -3. parseTerm sees '*'? yes, so left=-3, op='*', advance, right=parseFactor -> parsePrimary returns 4, left=-12. parseTerm returns -12. parseExpr returns -12. Good.
// "3 * -4" -> parseExpr: left = parseTerm -> parseFactor returns 3. parseTerm sees '*', so left=3, op='*', advance, right=parseFactor: sees '-', sign=-1, parsePrimary returns 4, factor returns -4. left=3*-4=-12. Good.
// "3 - -4" -> parseExpr: left = parseTerm -> parseFactor returns 3. parseExpr sees '-', op='-', advance, right = parseTerm -> parseFactor: sees '-', sign=-1, parsePrimary returns 4, factor returns -4. parseTerm returns -4. Then left = 3 - (-4) = 7. Good.
// "3 / -2" -> division truncating toward zero: 3 / -2 = -1.5, trunc -> -1? Actually, truncation toward zero: 3 / -2 = -1.5, trunc to -1? Wait, -1.5 truncated toward zero is -1? Because moving toward zero from -1.5 gives -1? Actually, truncation toward zero means remove fractional part, so -1.5 becomes -1? Let's think: For positive numbers, truncation removes fractional part, e.g., 1.5 -> 1. For negative numbers, truncation also removes fractional part, but the integer part is the number without fractional part, which for -1.5 is -1? The integer part of -1.5 is -1? Actually, the integer part is the number without the fractional part, but the sign is attached. Typically, the integer part of -1.5 is -1? Let's check: In C, integer division truncates toward zero: -3 / 2 = -1. So -1.5 becomes -1. So yes, truncation toward zero yields -1. So 3 / -2 = -1. Our Math.trunc(3 / -2) = Math.trunc(-1.5) = -1. Good.
// "-3 / 2" = -1.5 -> -1. Good.
// "-3 / -2" = 1.5 -> 1. Good.
// So division works.
// Now, what about nested parentheses: "((2+3)*4)" -> parseFactor: no unary, parsePrimary sees '(' then parseExpr, etc.
// So it's fine.
// But we need to handle the case where there is no token left after parsing, but we assume valid expression.
// Now, tokenization: We'll parse the string character by character.
// We'll define Token type: { type: 'NUM' | 'OP' | 'LPAREN' | 'RPAREN', value?: string } but we can just store strings.
// Actually, we can store tokens as strings: "NUM", "+", "-", "*", "/", "(", ")" but for numbers we need the numeric value. We can store as object: { type: 'NUM', value: number } or just store as number and operators as strings. But for simplicity, we can store tokens as strings for operators and numbers as strings, then parse numbers when needed.
// We'll have a token list: each token is either a string for operator/paren or a number for numeric literal.
// Implementation steps:
// - Read input line, trim.
// - Tokenize:
//   let tokens = [];
//   let i = 0;
//   while (i < input.length) {
//     let ch = input[i];
//     if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { i++; continue; }
//     if (/\d/.test(ch)) {
//       let start = i;
//       while (i < input.length && /\d/.test(input[i])) { i++; }
//       tokens.push(Number(input.slice(start, i))); // number
//     } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
//       tokens.push(ch);
//       i++;
//     } else {
//       // maybe ignore or error; but assume valid input.
//       i++;
//     }
//   }
// - Then set up parser with tokens, index.
// - Implement peek() and advance().
// - Implement parseExpr, parseTerm, parseFactor, parsePrimary.
// - In parseFactor, we need to handle unary operators. But careful: In our design, parseFactor will consume any leading '+' or '-' and then call parsePrimary. However, we must ensure that when we are in parseFactor, we don't accidentally consume a '+' or '-' that is actually binary? But parseFactor is called only when we expect a factor, i.e., after an operator or at the start. At those points, any '+' or '-' is unary. So it's safe.
// - However, there is a nuance: In parseTerm, after parsing left factor, we check if current token is '*' or '/'. If not, we return. So if the next token is '+' or '-', we don't consume it in parseTerm; it will be handled by parseExpr. So that's fine.
// - In parseExpr, after parsing left term, we check if current token is '+' or '-'. If so, we consume and call parseTerm for right operand. That's fine.
// - In parsePrimary, we handle numbers and parentheses.
// - In parsePrimary, if current token is a number, we consume and return it. If it's '(' we consume, call parseExpr, then expect ')', consume, and return the result.
// - We need to ensure that we don't have extra tokens after parsing; but we assume expression covers entire input.
// - Output: console.log(result) or process.stdout.write.
// Now, we need to be careful about integer overflow? The problem says all intermediate values fit in JavaScript safe integers, so no overflow.
// But we need to implement division truncating toward zero. In JavaScript, division of two integers yields a float; Math.trunc will produce integer. However, if the division result is not an integer, Math.trunc will give integer. But what about the case where a / b is exactly representable as a double but not integer? That's fine.
// But there is a potential issue: In JavaScript, division of two large integers might lose precision because the quotient might be beyond safe integer range? But the problem says intermediate values fit in safe integers, so the result of division should also be safe integer. So it's fine.
// However, we should be careful: When we compute a / b, if a and b are both safe integers, the result might be a float that is not exactly representable, but the integer part after truncation should be correct. There might be edge cases where the floating-point division yields a value slightly less than the true integer quotient due to rounding, causing truncation to give one less. For example, suppose a = 1, b = 3, true quotient 0.333..., double representation is 0.3333333333333333, Math.trunc gives 0, correct. For a = 7, b = 3, 7/3 = 2.333..., double is 2.3333333333333335, Math.trunc gives 2, correct. For a = -7, b = 3, -7/3 = -2.333..., double is -2.3333333333333335, Math.trunc gives -2, correct. So it's fine.
// But what about a = 2^53 - 1, b = 1? That's safe. a / b = a, which is safe integer, double representation is exact. So fine.
// So Math.trunc is okay.
// Alternatively, we could implement integer division using Math.sign and Math.floor on absolute values: q = Math.trunc(a / b) is simpler.
// Now, we need to ensure that we output the integer without decimal point. If the result is integer, it will be printed as integer. If it's a float due to division, we already truncated, so it's integer.
// But note: In JavaScript, numbers are always floats; when you print a number that is an integer, it prints without decimal if it's within safe integer? Actually, console.log(42) prints "42". console.log(42.0) prints "42"? It prints "42" as well because JavaScript doesn't differentiate. So fine.
// Now, we need to write TypeScript code. We'll define types for tokens maybe.
// Let's write the code.
// We'll create a class Parser or just functions with closure.
// We'll use a global tokens array and index, but better to encapsulate.
// I'll write a class Evaluator with tokenize and parse methods.
// But the problem just requires a complete program, so we can do simple procedural.
// Let's outline:
// import fs from 'fs'; // but Node.js doesn't require import? In TypeScript, we need to use require or import. Since it's Node.js, we can use import fs from 'fs'; if using ES modules, but typical Node.js scripts use require. However, the problem says "TypeScript program for Node.js". We can use ES module syntax with import. But to be safe, we can use require('fs').readFileSync. Since it's TypeScript, we can declare import.
// I'll use: import * as fs from 'fs'; or const fs = require('fs'); The latter is CommonJS, but TypeScript can handle both. I'll use import fs from 'fs'; with default import? Actually, fs is a module with named exports. So we can do: import fs from 'fs'; but that might not work because fs doesn't have a default export. In Node.js, you can do import fs from 'fs'; because of interop, but it's better to use import * as fs from 'fs';. I'll use: import * as fs from 'fs';
// Then: const input = fs.readFileSync(0, 'utf8').trim();
// Tokenize.
// Parse.
// Output.
// Let's code.
// We'll define Token type: interface Token { type: 'NUM' | 'OP' | 'LPAREN' | 'RPAREN'; value?: string | number; } but we can just use string/number.
// Actually, we can store tokens as: type Token = number | '+' | '-' | '*' | '/' | '(' | ')'; but that's not a union of literal types. We can define type Operator = '+' | '-' | '*' | '/'; type Paren = '(' | ')'; type Token = number | Operator | Paren; but then we need to differentiate numbers from operators. We can check typeof token ===
