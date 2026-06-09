interface Parser {
    str: string;
    pos: number;
    peek(): string | undefined;
    consume(): string;
    skipSpaces(): void;
    parse(): bigint;
    parseExpression(): bigint;
    parseTerm(): bigint;
    parseFactor(): bigint;
    parseUnary(): bigint;
    parsePrimary(): bigint;
    parseNumber(): bigint;
}

But we can just have a class.

Alternatively, we can implement recursively without class.

Let's do a class.

Implementation steps:

- In constructor, set str and pos=0.
- skipSpaces: while pos < str.length and str[pos] is whitespace, pos++.
- peek: return str[pos] or undefined.
- consume: return str[pos++] after checking.
- parseNumber: skipSpaces? Actually numbers are parsed when we expect a primary. We'll parse digits: let num = ''; while pos < len and isDigit(str[pos]): num += str[pos], pos++; return BigInt(num).

But note: numbers could be large, but within safe integer, so BigInt is fine.

- parsePrimary: skipSpaces; let ch = peek(); if ch is undefined, error; if ch is '(': consume '(', parseExpression(), consume ')', return result; else if isDigit(ch): return parseNumber(); else error.

- parseUnary: skipSpaces; if peek() is '+' or '-': let op = consume(); let val = parseUnary(); if op === '-': return -val; else: return val; else: return parseFactor().

But careful: unary operators have higher precedence than binary, so after unary we parse factor? Actually, unary should apply to the following expression, which could be a primary or a parenthesized expression. In our grammar, Unary := ('+'|'-') Unary | Primary. So we recursively parse Unary. So parseUnary should: skipSpaces; if peek() is '+' or '-': let op = consume(); let rhs = parseUnary(); then apply op; else return parseFactor().

- parseFactor: we need to handle exponent? No exponent. So factor is just unary. Actually, in our grammar, Factor := Unary. So parseFactor can just call parseUnary. But we need to differentiate? Actually, the grammar I defined: Expression := Term { (+|-) Term }; Term := Factor { (*|/) Factor }; Factor := Unary; Unary := ('+'|'-') Unary | Primary. So parseFactor should parse Unary. So we can have parseFactor = parseUnary.

But then parseTerm will parse Factor and then while peek is '*' or '/', consume and parse Factor again.

But careful: In our grammar, Factor is Unary, and Unary can be a primary or unary operators applied to primary. So that works.

But we need to ensure that after parsing a factor in term, we can have '*' or '/' and then another factor. That's fine.

Now, parseExpression: parseTerm, then while peek is '+' or '-', consume and parseTerm, apply.

Now, we need to handle division truncation: use BigInt division.

Now, output: print result.toString().

Now, we need to ensure we handle the entire expression, no trailing characters.

Now, implement in TypeScript.

Edge cases: expression may be empty? Probably not.

Now, write the code.

We'll also need to import fs: import * as fs from 'fs';

Now, the program.

Let's code.

But note: The problem says "Write a complete TypeScript program for Node.js." So we need to include the import and the code.

Now, I'll write the solution.

But before finalizing, test with some examples mentally.

Example: "3+4*2/(1-5)" => 3 + 8 / (-4) = 3 + (-2) = 1. Division truncates toward zero: 8 / -4 = -2 exactly. So result 1.

Example: " 3 + 4 * 2 / (1 - 5) " => same.

Example: "- - 3" => unary minus twice: -(-3) = 3.

Example: "5 * -3" => 5 * (-3) = -15. But is that allowed? In our grammar, after * we parse Factor which can be unary, so 5 * -3 is parsed as 5 * (unary minus 3) = -15. That's fine.

Example: "5 / 2" => 2 (since truncation toward zero: 5/2 = 2.5 -> 2). Using BigInt: 5n / 2n = 2n.

Example: "-5 / 2" => -2 (since -5/2 = -2.5 -> -2). BigInt: -5n / 2n = -2n? Let's check: -5n / 2n = -2n? Actually, -5 / 2 = -2.5, truncation toward zero gives -2. In BigInt, -5n / 2n = -2n? I think -5n / 2n = -2n because division truncates toward zero. Let's verify: In JavaScript, -5n / 2n yields -2n. Yes.

Example: "5 / -2" => -2.

Example: "-5 / -2" => 2.

Now, test with the problematic case: large numbers. For instance, a = 9007199254740991n, b = 2n. a / b = 4503599627370495n.5? But BigInt division truncates toward zero, so it yields 4503599627370495n. That's correct.

Now, ensure that we handle spaces and parentheses deeply.

Now, about unary operators: The grammar allows unary + and - before any expression. But what about something like "+ - 5"? That's unary plus then unary minus 5 => -5. That's fine.

Now, we need to ensure that after a binary operator, we can have unary operators on the right operand. Our grammar allows that because after parsing a factor, we can have '*' or '/' and then parse factor, which can be unary.

Now, what about something like "5 - - 3"? That is parsed as Expression: Term (5) then '-' then Term (which is Factor: Unary: '-' then Unary: Primary (3)) => -(-3) = 3, so 5-3=2. Works.

Now, what about "5 - - - 3"? That's 5 - (-( -(3)))? Actually, unary minus applied three times: - - - 3 = -3? Because -(-(-3)) = -3? Let's compute: -(-(-3)) = - ( - ( -3 ) ) = - ( 3 ) = -3. So 5 - (-3) = 5 + 3 = 8? Wait, careful: "5 - - - 3" means 5 minus ( - - - 3). The right operand of minus is the unary expression - - - 3, which is -3. So 5 - (-3) = 5 + 3 = 8. Our parser should handle that because after '-' we parse Term, which parses Factor, which parses Unary, which recursively parses Unary, which eventually parses Primary (3). So it will compute -(-(-3)) = -3. Then 5 - (-3) = 8. Good.

Now, what about expression like " - 5 * 3"? That is unary minus 5 times 3 = -15. Our parser: Expression parses Term: Factor: Unary: '-' then Unary: Primary? Actually, Unary: '-' then Unary: Factor? Wait, after '-' we call parseUnary recursively. That recursive call will skipSpaces, peek is '5'? Actually, after '-', we call parseUnary. That parseUnary will skipSpaces, see '5' which is not '+' or '-', so it returns parseFactor(). parseFactor returns parseUnary() again? Actually, parseFactor calls parseUnary. So parseUnary -> parseFactor -> parseUnary -> parsePrimary? This recursion might be confusing. Let's define clearly:

We have:

parseExpression:
   let left = parseTerm();
   while (peek is '+' or '-'):
       let op = consume();
       let right = parseTerm();
       left = op === '+' ? left + right : left - right;
   return left;

parseTerm:
   let left = parseFactor();
   while (peek is '*' or '/'):
       let op = consume();
       let right = parseFactor();
       left = op === '*' ? left * right : left / right; // BigInt division
   return left;

parseFactor:
   return parseUnary();

parseUnary:
   let op = peek();
   if (op === '+' or op === '-'):
       consume();
       let rhs = parseUnary();
       return op === '-' ? -rhs : rhs;
   else:
       return parsePrimary();

parsePrimary:
   skipSpaces();
   let ch = peek();
   if (ch === '('):
       consume();
       let expr = parseExpression();
       consume(); // ')'
       return expr;
   else if (isDigit(ch)):
       return parseNumber();
   else:
       error;

parseNumber:
   let num = '';
   while (is
