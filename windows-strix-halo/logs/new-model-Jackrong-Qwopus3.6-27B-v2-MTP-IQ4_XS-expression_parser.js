"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function evaluate(expression) {
    // Use a shunting-yard algorithm with explicit handling of unary operators.
    // We first tokenise the input into numbers, operators, and parentheses.
    const tokens = [];
    let i = 0;
    const len = expression.length;
    while (i < len) {
        const ch = expression[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch === '(' || ch === ')') {
            tokens.push({ type: 'paren', char });
            i++;
            continue;
        }
        if (ch === '-' || ch === '+') {
            // Determine if this is unary or binary.
            // It's unary if it's the first token, or if the previous non-space token was an operator or '('.
            const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
            const isUnary = prevToken === null ||
                prevToken.type === 'op' ||
                (prevToken.type === 'paren' && prevToken.char === '(');
            if (isUnary) {
                // Unary + or -. We'll treat unary - as a special operator.
                tokens.push({ type: 'op', char });
                i++;
                continue;
            }
            else {
                // Binary + or -
                tokens.push({ type: 'op', char });
                i++;
                continue;
            }
        }
        if (ch === '*' || ch === '/') {
            tokens.push({ type: 'op', char });
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = 0;
            while (i < len && expression[i] >= '0' && expression[i] <= '9') {
                num = num * 10 + (expression.charCodeAt(i) - 48);
                i++;
            }
            tokens.push({ type: 'number', value: num });
            continue;
        }
        throw new Error(`Unexpected character: ${ch}`);
    }
    // Now we have tokens. We need to distinguish unary operators from binary ones during parsing.
    // Let's refine the token list to mark unary vs binary.
    const refinedTokens = [];
    for (let t = 0; t < tokens.length; t++) {
        const token = tokens[t];
        if (token.type === 'number' || token.type === 'paren') {
            refinedTokens.push(token);
        }
        else if (token.type === 'op') {
            // Determine if this operator is unary or binary.
            // An operator is unary if it's at the start, or preceded by '(' or another operator.
            const prevToken = refinedTokens.length > 0 ? refinedTokens[refinedTokens.length - 1] : null;
            const isUnary = prevToken === null ||
                prevToken.type === 'op' ||
                (prevToken.type === 'paren' && prevToken.char === '(');
            if (isUnary) {
                refinedTokens.push({ type: 'op', char: token.char + 'u' }); // Mark as unary
            }
            else {
                refinedTokens.push(token);
            }
        }
    }
    // Define precedence and associativity.
    // Unary operators have the highest precedence.
    // * and / have higher precedence than + and -.
    function precedence(token) {
        if (token.type !== 'op')
            return -1;
        const c = token.char;
        if (c === 'u+' || c === 'u-')
            return 3; // Unary
        if (c === '*' || c === '/')
            return 2; // Multiplicative
        if (c === '+' || c === '-')
            return 1; // Additive
        return 0;
    }
    // Associativity for binary operators.
    // Unary operators are right-associative, but we handle them differently.
    function isLeftAssociative(token) {
        if (token.type !== 'op')
            return false;
        const c = token.char;
        if (c === 'u+' || c === 'u-')
            return false; // Right-associative
        return true; // All binary operators are left-associative
    }
    // Shunting-yard algorithm
    const outputQueue = [];
    const opStack = [];
    for (const token of refinedTokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        }
        else if (token.type === 'op') {
            while (opStack.length > 0) {
                const top = opStack[opStack.length - 1];
                if (top.type === 'paren' && top.char === '(')
                    break;
                const tPrec = precedence(top);
                const cPrec = precedence(token);
                if ((tPrec > cPrec) ||
                    (tPrec === cPrec && isLeftAssociative(token))) {
                    outputQueue.push(opStack.pop());
                }
                else {
                    break;
                }
            }
            opStack.push(token);
        }
        else if (token.type === 'paren') {
            if (token.char === '(') {
                opStack.push(token);
            }
            else if (token.char === ')') {
                while (opStack.length > 0) {
                    const top = opStack.pop();
                    if (top.type === 'paren' && top.char === '(')
                        break;
                    outputQueue.push(top);
                }
                if (opStack.length === 0) {
                    throw new Error('Mismatched parentheses');
                }
            }
        }
    }
    while (opStack.length > 0) {
        const top = opStack.pop();
        if (top.type === 'paren') {
            throw new Error('Mismatched parentheses');
        }
        outputQueue.push(top);
    }
    // Evaluate the RPN (Reverse Polish Notation) queue
    const valueStack = [];
    for (const token of outputQueue) {
        if (token.type === 'number') {
            valueStack.push(token.value);
        }
        else if (token.type === 'op') {
            const c = token.char;
            if (c === 'u-') {
                const a = valueStack.pop();
                valueStack.push(-a);
            }
            else if (c === 'u+') {
                const a = valueStack.pop();
                valueStack.push(+a);
            }
            else if (c === '+') {
                const b = valueStack.pop();
                const a = valueStack.pop();
                valueStack.push(a + b);
            }
            else if (c === '-') {
                const b = valueStack.pop();
                const a = valueStack.pop();
                valueStack.push(a - b);
            }
            else if (c === '*') {
                const b = valueStack.pop();
                const a = valueStack.pop();
                valueStack.push(a * b);
            }
            else if (c === '/') {
                const b = valueStack.pop();
                const a = valueStack.pop();
                // Division truncates toward zero
                const result = Math.trunc(a / b);
                valueStack.push(result);
            }
        }
    }
    if (valueStack.length !== 1) {
        throw new Error('Invalid expression');
    }
    return valueStack[0];
}
const input = fs_1.default.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
