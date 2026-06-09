let value = parseTerm()
  while true:
    skipSpaces()
    if pos < length and (input[pos] === '+' || input[pos] === '-'):
      let op = input[pos]; pos++;
      let right = parseTerm();
      if op === '+') value += right;
      else value -= right;
    else break;
  return value;

parseTerm():
  skipSpaces()
  let value = parseFactor()
  while true:
    skipSpaces()
    if pos < length and (input[pos] === '*' || input[pos] === '/'):
      let op = input[pos]; pos++;
      let right = parseFactor();
      if op === '*') value *= right;
      else {
        // division truncating toward zero
        value = Math.trunc(value / right);
      }
    else break;
  return value;

parseFactor():
  skipSpaces()
  if pos < length && input[pos] === '(':
    consume('(')
    let value = parseExpression()
    consume(')')
    return value;
  else:
    return parseUnary();

parseUnary():
  skipSpaces()
  if pos < length && (input[pos] === '+' || input[pos] === '-'):
    let op = input[pos]; pos++;
    let value = parseUnary();
    if op === '-') return -value;
    else return value;
  else:
    return parseNumber();

parseNumber():
  skipSpaces()
  if pos >= length || isNaN(parseInt(input[pos])):
    // error
    throw new Error("Expected number");
  let start = pos;
  while pos < length && !isNaN(parseInt(input[pos])):
    pos++;
  return parseInt(input.substring(start, pos));

But note: parseInt with base 10 will parse digits. However, we must ensure we only parse digits. We can just check if char is between '0' and '9'.

Now, we need to handle the case where after a number, there might be more characters like ')', '*', etc. That's fine.

Now, we need to read input: fs.readFileSync(0, "utf8") returns a string possibly with newline. We'll trim it.

Now, we need to output the result.

Now, we need to write TypeScript code. We'll define a function evaluate(expression: string): number.

We'll use the parser.

Now, we must be careful about unary operators after parentheses? For example, "(-2)" works as described. But what about "-(2)"? That is unary minus applied to (2). In our grammar, parseFactor will see '-', then call parseUnary, which will see '-', consume, then call parseUnary again, which will see '('? Actually after the first '-', parseUnary calls parseUnary again. That second parseUnary will see '('? But '(' is not a unary operator, so it will go to else branch and call parseNumber? That would be wrong because '(' is not a number. So we need to adjust: parseUnary should only handle unary operators if the next token is '+' or '-'. But after a unary operator, the operand could be a factor, not necessarily a unary. Actually the operand of a unary operator is a factor (which could be a number, parentheses, or another unary). So we should not recursively call parseUnary; instead, after consuming a unary operator, we should parse a factor. But careful: In our grammar, Factor includes Unary, but Unary is defined as (+|-)* Number. That means after a unary operator, we can have either another unary or a number. But if we have a parenthesis, that is a Factor directly, not a Unary. So the proper grammar:

Expression -> Term { (+|-) Term }
Term -> Factor { (*|/) Factor }
Factor -> ( Expression ) | Unary
Unary -> (+|-) Unary | Number

But this grammar is left-recursive for Unary? Actually Unary -> (+|-) Unary | Number. That's fine, it's right-recursive. So after a unary operator, we parse Unary again, which could be another unary or a number. But what about parentheses? Parentheses are not part of Unary; they are in Factor. So if we have "-(2)", the Factor will be ( Expression ), not Unary. So in parseFactor, if we see '(', we handle it. If we see a unary operator, we should parse Unary, which will handle the unary operators and then eventually a number. But if we have "-(2)", the first character is '-', which is a unary operator. According to our grammar, Factor -> Unary, and Unary -> (+|-) Unary | Number. But here after '-', the next token is '(', which is not a unary operator and not a number. So it would fail. Therefore we need to allow Unary to also handle factors that are parentheses? Actually the typical grammar for arithmetic expressions with unary operators is:

Expr -> Add
Add -> Mul { (+|-) Mul }
Mul -> Unary { (*|/) Unary }
Unary -> (+|-) Unary | Primary
Primary -> Number | ( Expr )

This is more standard: Unary can be a prefix operator applied to a Unary (which could be another unary or a primary). But note: In this grammar, Unary -> (+|-) Unary means that after a unary operator, we parse a Unary, which can be another unary or a primary. But primary includes numbers and parentheses. So if we have "-(2)", we would parse: Unary sees '-', then it needs to parse a Unary. That Unary would then see '('? But '(' is not a unary operator and not a number, but it is a primary? Actually primary is defined as Number | ( Expr ). So in the Unary -> (+|-) Unary rule, the right-hand side Unary must eventually resolve to a primary. But the parser for Unary would need to decide whether to apply the unary operator to a Unary that might be a primary. Typically, the grammar is:

Unary -> (+|-) Unary
       | Primary

But that is ambiguous because after a unary operator, you could have a Primary directly. However, if we define Unary -> (+|-) Unary | Primary, then after '-', we parse Unary. If the next token is '(', then Unary would try to match Unary -> (+|-) Unary (no) or Unary -> Primary. Primary -> ( Expr ) would match. So that works. But careful: If we have "- - 3", the first '-' consumes, then we parse Unary. That Unary sees '-', so it matches Unary -> (+|-) Unary, so it consumes '-', then parses Unary again, which sees '3' and matches Primary -> Number. So that works.

Thus the correct grammar is:

Expression -> Term { (+|-) Term }
Term -> Factor { (*|/) Factor }
Factor -> Unary
Unary -> (+|-) Unary | Primary
Primary -> Number | ( Expression )

But note: In many parsers, they combine Factor and Unary: Factor -> ( Expression ) | Unary, and Unary -> (+|-) Unary | Number. But then "-(2)" fails because after '-' we parse Unary, which expects either another unary or a number, but '(' is neither. So we need to allow Unary to also produce a Primary that includes parentheses. So we should either have Unary -> (+|-) Unary | Primary, with Primary -> Number | ( Expression ). That works.

Alternatively, we can keep Factor -> ( Expression ) | Unary, and Unary -> (+|-) Unary | Number. Then "-(2)" would be parsed as: Factor sees '-', but Factor expects either '(' or Unary. It sees '-', so it goes to Unary. Unary sees '-', consumes, then calls Unary again. That second Unary sees '('? But Unary expects either '+'/'-' or Number. '(' is not allowed, so it would fail. So that's not good.

Thus we need to incorporate parentheses into the Unary production or have Unary produce Primary.

Simpler: Use the standard recursive descent with:

parseExpression -> parseAddSub
parseAddSub -> parseMulDiv { (+|-) parseMulDiv }
parseMulDiv -> parseUnary { (*|/) parseUnary }
parseUnary -> if current is '+' or '-', consume, return parseUnary (with sign) else return parsePrimary
parsePrimary -> if current is '(', parseExpression, consume ')', else parseNumber

This is common. Let's test: For "-(2)", parseUnary sees '-', consumes, then calls parseUnary again. That second parseUnary sees '('? But parseUnary only handles '+'/'-' or delegates to parsePrimary? Actually in this design, parseUnary checks if current is '+' or '-', if so, it consumes and recursively calls parseUnary. Otherwise, it returns parsePrimary. So for "-(2)", first parseUnary sees '-', consumes, then calls parseUnary. That second parseUnary sees '(' which is not '+' or '-', so it goes to else and calls parsePrimary. parsePrimary sees '(' and parses expression inside, returns 2, then expects ')'. So that works. Good.

Now, for "- - 3", first parseUnary sees '-', consumes, calls parseUnary. Second parseUnary sees '-', consumes, calls parseUnary. Third parseUnary sees '3', not '+'/'-', so calls parsePrimary, which parses number 3, returns 3. Then second parseUnary returns -3, first returns -(-3)=3. Good.

Now, for "2 * -3", parseMulDiv calls parseUnary, which sees '2'? Actually parseUnary will see '2' (not '+'/'-'), so it calls parsePrimary, which parses number 2, returns 2. Then parseMulDiv sees '*', consumes, then calls parseUnary again. That parseUnary sees '-', consumes, then calls parseUnary, which sees '3', not '+'/'-', so parsePrimary parses 3, returns 3, then parseUnary returns -3. Then parseMulDiv multiplies 2 * -3 = -6. Good.

Now, for "2 + -3", parseAddSub calls parseMulDiv which returns 2, then sees '+', consumes, then calls parseMulDiv again. parseMulDiv calls parseUnary, which sees '-', consumes, then parseUnary calls parseUnary, which sees '3', parsePrimary returns 3, then parseUnary returns -3, then parseMulDiv returns -3 (since no * or /). Then parseAddSub adds 2 + (-3) = -1. Good.

Now, for parentheses: "(2)", parsePrimary handles.

Now, for nested: "((2))", parsePrimary sees '(', calls parseExpression, which will parse add/sub, etc. That works.

Now, for division truncation
