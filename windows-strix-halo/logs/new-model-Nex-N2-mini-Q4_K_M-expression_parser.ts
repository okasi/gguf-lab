function scan(input: string): Token[] {
const tokens: Token[] = [];
let i=0, n=input.length;
while(i<n){
const ch=input[i];
if(/\s/.test(ch)){ i++; continue; }
if(isDigit(ch)){
let j=i+1;
while(j<n && isDigit(input[j])) j++;
tokens.push({type:"number", value:Number(input.slice(i,j))});
i=j;
} else if(ch === '(' || ch===')') { tokens.push({type:"paren", value:ch}); i++; }
else if(ch==='+'||ch==='-'||ch==='*'||ch==='/') { tokens.push({type:"op", value:ch}); i++; }
else throw new Error("Unexpected character");
}
return tokens;
}
Need regex /\s/ maybe okay. Could use ch.trim() === ''. Fine. Use Number for parseInt. For all safe. parseInt no radix okay but use 10.
Type Token union:
type Token = { kind:"number"; value:number } | { kind:"op"; value:"+"|"-"|"*"|"/" } | { kind:"paren"; value:"(" | ")" };

Function precedence:
function isBinary(op: string): op is "+"|"-"|"*"|"/" { return ...}
function opPrec(op:string): number { if op==='+'||op==='-' return 1; if op==='*'||op==='/' return 2; return 3; } // includes unary.
function isUnaryOp(op: string): boolean { return op === "+" || op === "-"; }
function isRightAssociative(op: string): boolean { return op === "+" || op === "-" || op === "(": hmm for '('? When current op is '(', right-assoc true. In shunting-yard, if current op is '(', push regardless. For current op '*' right-assoc false. For current op '-' could be unary or binary but right-assoc true. Good.
function shouldPop(currentOp, topOp):
if topOp === '(' false;
if !isBinary(currentOp) return false; // current op op only
if currentOp === "(" return false;
const pCurrent = precedence(currentOp);
const pTop = precedence(topOp);
return pTop > pCurrent || (pTop === pCurrent && !isRightAssociative(currentOp));
But topOp could be unary '-' or binary '-' both prec 1. right assoc for current '-' means don't pop. For top '(' no. For top op '*' prec2. Good.
Actually if topOp is unary '-' and current op is '-' (unary), pTop 1, pCurrent 1, right assoc true, don't pop. Good.
For current op '*' pCurrent 2, top unary '-' pTop 1? Wait unary '-' precedence 3. Good.
For current op '+' pCurrent 1, top '+' pTop1, right assoc true don't pop. Good.

Need while top stack and !rightAssoc pop.
let top = ops[ops.length - 1];
if (top === '(' || !isBinaryOp(top) || !shouldPop(currentOp, top as op)) break;

Need types. Could simplify:
function shouldPop(current: Op, top: Op | "(":
if (top === "(") return false;
if (!isOp(top)) return false;
const currentPrec = precedence(current);
const topPrec = precedence(top);
return topPrec > currentPrec || (topPrec === currentPrec && !rightAssociative(current));
But if top is unary '-' or binary '-' isOp returns true. Precedence 1. Good.

Need apply op:
function applyOperator(op: Op, values: number[]): number {
if (op === "+" || op === "-") {
const operand = values.pop();
if (operand === undefined) throw...
return op === "-" ? -operand : operand;
}
const right = values.pop();
const left = values.pop();
if undefined error
switch...
}
Need TypeScript strictNullChecks? We can write with assertions. Complete program can use no compile flags. But to be robust:
function popValue(values: number[]): number { const v = values.pop(); if (v === undefined) throw new Error("Invalid expression"); return v; }

Need if apply unary when top op stack contains '-' but it's binary, pop count 1 still correct. Good.

Potential issue: In shunting-yard, unary plus/minus should not be output after operands? It is popped at end. Good.

Could also implement Pratt parser iterative? Not needed.

Now, maybe "unary +/-, then * and /, then + and -" Means unary has higher precedence than multiplication, but right-associative. Good.

Let's think of edge cases:
Expression "(" -> invalid no.
"1 2" invalid no.
"1 / 2" => Math.trunc(0.5)=0.
"1 / -2" => -0.5 trunc 0.
"-1 / 2" => -0.5 trunc 0.
"-1 / -2" => 0.5 trunc 0.
"5 / -2" => -2.5 trunc -2.
"1000000000000000000" within safe? 1e18 safe? Max 9007199254740991, so 1e18 not safe? They guarantee intermediate safe, input integers maybe safe? "containing integers" maybe within safe. parseInt returns safe if input safe.
"1000000000000000000 / 2" would not fit safe input? Not.

Need maybe if input line contains multiple lines? Problem says one line. If read all, whitespace includes newline. If expression has newline after, okay. If expression contains embedded newline as whitespace, okay.

Need output newline? Fine.

Need "Return only TypeScript code, no explanation and no Markdown fence." final only code.

Before final, consider if "unary + / -" maybe they intended unary + and unary - have same precedence as binary + and -? No, explicitly precedence: unary +/-, then * and /, then + and -. Good.

Potential issue with unary plus/minus and parentheses: "(-)" invalid.
"(-2)" parse unary -2. Good.

Potential issue: "1(-2)" invalid no.

Now, maybe "binary + - * /, and unary + / -." In input, a minus after a minus could be binary or unary. Shunting-yard with top '-' prec1 and current '-' prec3 will not pop. Good.

Let's consider if top op binary '-' and current op '*' after negative base:
Expression "-2 * 3":
ops: ['-', '*'] with '-' unary? Actually top '-' precedence 1 if we treat all '-' same. Wait I earlier said unary '-' precedence 3. But if I set precedence("-") = 3, then binary '-' also precedence 3 in op stack. This is crucial! In shunting-yard, if top op is binary '-' and current op '*' (prec2), pTop 3 >2, algorithm would pop binary '-' before multiplication, causing wrong: for "-2 * 3", after '-' push, 2, '*' -> top '-' prec3 >2 pop unary -2, good. But for "1 - 2 * 3", after 1, binary '-' prec3? If I set '-' precedence 3 globally, top '-' prec3 > current '*' prec2, algorithm would pop binary '-' before '*' -> result (1-2)*3=-3, wrong. Ah! Need distinguish unary minus precedence 3 from binary minus precedence 1. Similarly binary plus precedence1, unary plus precedence3. This is important. Our "opPrec" cannot be global 1 for '-' if binary. Need mark tokens as unary or binary. For shunting-yard, we can assign precedence based on op kind. Stack stores OpToken with isUnary boolean. Current op might be unary or binary? In shunting-yard, when encountering an operator, can we know if unary? It depends on previous token (whether it expects operand). But with precedence approach, the algorithm can handle based on stack context? Need be careful.

For binary '-' in "1 - 2 * 3", current op '-' should have precedence 1, not 3. For unary '-' in "-2 * 3", current op '-' should have precedence 3. For binary '+'? plus can't be unary? unary plus can appear at start, after '(' or after operator. Binary plus precedence 1. Need identify current operator's role. Could mark operators as unary if previous significant token is operator or '(' or start. In expression "1--2", second '-' previous token '-' so unary. In "-2 * 3", first '-' previous none so unary. In "1 - -2", second '-' previous token '-' so unary. In "1 -(-2)" previous '(' so unary. In "1 + -2" previous '+' unary. Good. In "1 + +2" unary plus. In "1 + (+2)" unary plus after '('.
So scanner or parser can know.

But shunting-yard algorithm with unary operator inserted into operator stack as prec3. Binary operators prec1/2. Need classify current op at time. We can scan tokens with roles? Or implement parser that knows context. Let's revisit.

Simpler: Use grammar/pratt with unary precedence. Could implement recursive descent; unary operator precedence 3. But deep issue.

Shunting-yard:
- Need operator stack with op and precedence: unary op prec3, binary + - prec1, binary * / prec2.
- When reading an operator char, determine if it is unary. If previous significant token is operator or '(' or at start, then unary. Else binary.
- For binary op, push with prec1/2.
- For unary op, push with prec3, right-assoc.
- Then precedence comparison top op prec vs current op prec. Good.

But there is subtlety with unary operator after ')' maybe binary? "1(-2)" invalid. After ')' only binary or end/paren. If operator follows ')' it's binary (e.g., "1+2"). But previous token is ')' not operator or '(', so classify binary. Good.
Need for unary '-' after binary '-'? Previous significant token is '-' (operator), yes unary. Good.
Need for unary '+' after ')' invalid no.

Could implement scanner to produce tokens with operator role? Maybe easier to incorporate in main tokenization:
let previousTokenWasOperatorOrLParen = false;
let previousTokenKind: "none" | "number" | "op" | "paren";
When reading operator:
const isUnary = previousTokenKind === "none" || previousTokenKind === "op" || previousTokenKind === "paren";
tokens.push({kind:"op", value:ch, unary: isUnary});
previousTokenKind = "op";
But isUnary classification for binary '-' in "1 -2" where no explicit binary operator? invalid.
For "1 - -2": first '-' previous none? Wait previous significant before first '-' is number '1', so binary. Then previous op. second '-' unary. Good.
For "-2 * 3": first '-' previous none unary. Good.
For "1 * -2": previous '*' op -> unary.
For "(+2)": previous '(' -> unary.
For "(-2)": previous '(' -> unary.
For "1(-2)" previous ')' and operator, but operator after ')' would be binary by this rule, invalid. Good.

Need stack top op precedence. If top op unary prec3, pop when current binary prec lower. If top op binary '-' prec1, don't pop before current unary prec3. But unary current is pushed after binary. At end, unary popped before binary? Example "1 - -2": tokens binary '-' (prec1), unary '-' (prec3), operand. End pops unary then binary. Good.
Example "1 - -2 * 3": binary '-' prec1, unary '-' prec3, operand, '*' prec2. When current '*' prec2, should pop top unary '-' (prec3 >2), then top binary '-' prec1 >2 false, push '*'. Good.
Example "-2 * 3": unary '-' prec3, 2, '*' prec2: pop unary before '*', good.
Example "(-2) * 3": unary '-' inside parens popped before right paren. Good.
Example "1 / -2 / 3": binary '/' prec2, unary '-' prec3, 2, binary '/' prec2: current '/' prec2, top unary prec3 >2 pop unary; top binary '/' prec2 equal pop left assoc => (1/-2)/3. Good.

Need classify current operator role. Could also in shunting-yard determine when popping top same precedence: for unary '-' top and current '-' (unary), right-assoc true. If top binary '-' prec1 and current binary '-' prec1, right-assoc true. No difference. For current binary '-' after binary '-' top, not pop. Good.
For current binary '*' after binary '-' top, top prec1 >2 false. Good.

Need implement Op with unary boolean.
type Operator = { type: "op"; value: Op; unary: boolean; precedence: number };
But Op includes all. precedence function:
if value === "+" || value === "-" { return unary ? 3 : 1; }
if value === "*" || value === "/" return 2.
Right associative: value === "+" || value === "-" || value === "("? For unary plus/minus true; for binary plus/minus false. For current op? If current operator is unary plus/minus, right-assoc true. For current op binary, false. For '(', push true but not used.
function shouldPop(current: Operator, top: Operator):
if top.value === "(" return false;
if (!isOp(top.value)) false;
const currentPrec = current.precedence;
const topPrec = top.precedence;
return topPrec > currentPrec || (topPrec === currentPrec && !isRightAssociative(current));
Right-assoc for unary plus/minus true. For current binary * / false. For current '(' true. For current op maybe unary? Good.

Need while stack top:
let top = opStack[opStack.length-1];
if (top === "(" || !isOp(top) || !shouldPop(currentOp, top)) break;
pop apply.
But top is Operator | "("; isOp returns true for op tokens. Good.

Need operator stack can contain unary operators. applyOperator:
const op = popOp();
if (op.unary) { pop one; return op.value === '-' ? -operand : operand; }
else { pop two; switch op.value; }
Need for unary plus/minus only. If op.value '*' but op.unary false. Good.

Need scanner classify operators. Need know previous significant token.
Could use enum TokenKind { Number, Op, LParen, RParen }? Simpler:
let lastSignificant: "none" | "number" | "operator" | "paren";
For '(' or ')' set to "paren".
When reading op:
const unary = lastSignificant === "none" || lastSignificant === "operator" || lastSignificant === "paren";
tokens.push({kind:"op", value:ch, unary});
lastSignificant = "operator";
But wait for "1 - -2", after first '-' lastSignificant operator. second unary. Good.
For "1 - (-2)", after first '-' operator, '(' paren, '-' unary. Good.
For "- - 2", first unary, lastSignificant operator, second unary. Good.

However, in shunting-yard, unary operator after ')' in invalid "1(-2)" would be classified binary because lastSignificant parenthesis? Actually lastSignificant after ')' is "paren"; unary = true. Then stack top '('? There is no '(', top maybe number 1, push unary op before 2; then 2; end pop unary -> 2; pop number 1? Actually values [1,2], op unary. At end pop unary -> 2, values [1,2]. End leftover values length 2 -> error. So invalid. Fine.
But in valid "1 + (-2)", after '(' top '(', unary.

Need if scanner classifies '-' in "1 -2" as binary because lastSignificant number, no unary. Then invalid. Fine.

Could also not classify op role in scanner but in main when encountering operator, determine unary based on last token emitted. But if tokenization emits op with role, okay.

Need maybe "lastSignificant" after '(' should be paren. For "(-2)" yes.

Potential issue: The operator precedence relation for unary minus: Should unary minus bind tighter than multiplication. We did. But for "1 - -2 * 3", current '*' after unary -; algorithm pops unary - before pushing '*'. Good.
Potential issue: For "1 / -2 * 3", after unary '-' pushed, current '*' pops unary then binary '/', due left assoc. Good.
Potential issue: For "1 * -2 / 3", after unary '-' pushed, current '/'? Wait tokens: 1, *, unary -, 2, /. When current '/' prec2, top unary '-' prec3 >2 pop unary, top '*' prec2 equal pop binary '*', push '/', 3, end: (1*-2)/3=-0. Good.
Potential issue: For "1 / -2 * 3" with left assoc after unary: (1/-2)*3 = 0*3=0. Good.
Potential issue: For "1 - 2 / -3": 2 / -3 => -0.666 trunc 0; 1-0=1. Algorithm: binary '-' prec1, binary '/' prec2, unary '-' prec3, 3, end pop unary 3, pop binary / 0, pop binary - 1. Good.
Potential issue: For "-1 - -2": unary -1, binary -, unary -2. End pop unary 2, pop binary - => -1 - -2 =1. Good.

Now, if we classify current operator as unary based on last significant. But after reading an operator, before tokenization, lastSignificant for binary '-' is operator. So if next char is operator, unary. Good.

Need maybe skip whitespace before determining role. We update lastSignificant only for non-whitespace.

Need use Array as stack. TypeScript arrays.

Potential issue: "all intermediate values fit in JS safe integers" but multiplication might temporarily overflow before division? Example "-9007199254740991 * 1 / 2" intermediate safe? If multiplication of -9007199254740991 * 1 = safe; okay. If a*b > max safe but final after division fits, guarantee says all intermediate fit, so no.
Need if parse value Number(input.slice) safe. parseInt returns number. Good.

Need maybe include "const OP_CHARS = new Set" not necessary. Avoid external.

Could implement "readFileSync(0, "utf8")" exactly. Use import fs = require("fs")? TypeScript with esModuleInterop? If use `import * as fs from "fs";` no external packages. Complete.

Need maybe if TS compilation target not module? `import` okay.

Now, let's think if "shunting-yard evaluator" with unary op inserted in stack but top precedence for unary '-' being 3. Need not pop binary '-' before unary current. Example "1 - -2": current unary '-' prec3, top binary '-' prec1, shouldPop false, push unary. Good.
But if operator stack top is binary '-' and current operator is binary '-' (same prec), right assoc true, so don't pop. Good.
