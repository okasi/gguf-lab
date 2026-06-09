"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const input = fs_1.default.readFileSync(0, 'utf8').trim();
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        if (input[i] === ' ') {
            i++;
            continue;
        }
        if (input[i] === '(' || input[i] === ')') {
            tokens.push({ type: 'paren', value: input[i] });
            i++;
            continue;
        }
        if ('+-*/'.includes(input[i])) {
            tokens.push({ type: 'operator', value: input[i] });
            i++;
            continue;
        }
        if (/[0-9]/.test(input[i])) {
            let numStr = '';
            while (i < input.length && /[0-9]/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseInt(numStr, 10) });
            continue;
        }
        throw new Error(`Unexpected character: ${input[i]}`);
    }
    return tokens;
}
// Shunting-yard algorithm
// Precedence: unary +/- highest, then * /, then + -
// We'll use a recursive descent or shunting-yard.
// Let's use shunting-yard.
// Precedence levels
// unary + and - : 4
// * and / : 3
// binary + and - : 2
// ( : 1 (lowest, for left-associative)
function getPrecedence(token) {
    if (token.type === 'operator') {
        if (token.value === '*' || token.value === '/') {
            return 3;
        }
        if (token.value === '+' || token.value === '-') {
            return 2;
        }
    }
    return 0;
}
// Determine if an operator is unary
// Unary + or - appears at the beginning of the expression or after an opening parenthesis or after another operator.
function isUnary(tokens, index) {
    if (tokens[index].type !== 'operator')
        return false;
    if (tokens[index].value !== '+' && tokens[index].value !== '-')
        return false;
    // Check if it's at the beginning or after '(' or after another operator
    if (index === 0)
        return true;
    const prevToken = tokens[index - 1];
    if (prevToken.type === 'paren' && prevToken.value === '(')
        return true;
    if (prevToken.type === 'operator')
        return true;
    return false;
}
// Shunting-yard algorithm
function shuntingYard(tokens) {
    const output = [];
    const ops = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'number') {
            output.push(token);
        }
        else if (token.type === 'operator') {
            if (isUnary(tokens, i)) {
                // Unary operator, push to ops with higher precedence
                // We'll mark it as unary by wrapping in a special token
                // Actually, let's just push it to ops and handle precedence
                // Unary + and - have precedence 4
                while (ops.length > 0 && ops[ops.length - 1].type === 'operator') {
                    const top = ops[ops.length - 1];
                    // Unary has higher precedence than binary, so we only pop if the top is also unary and same or higher precedence
                    // Actually, unary + and - have the same precedence, and they are right-associative.
                    // For right-associative operators, we only pop if the top has strictly greater precedence.
                    // Unary precedence is 4.
                    const topPrec = getPrecedence(top);
                    if (topPrec > 4) {
                        output.push(ops.pop());
                    }
                    else {
                        break;
                    }
                }
                ops.push(token);
            }
            else {
                // Binary operator
                while (ops.length > 0 && ops[ops.length - 1].type === 'operator') {
                    const top = ops[ops.length - 1];
                    const topPrec = getPrecedence(top);
                    const currPrec = getPrecedence(token);
                    if (topPrec >= currPrec) {
                        output.push(ops.pop());
                    }
                    else {
                        break;
                    }
                }
                ops.push(token);
            }
        }
        else if (token.type === 'paren') {
            if (token.value === '(') {
                ops.push(token);
            }
            else {
                // ')'
                while (ops.length > 0 && ops[ops.length - 1].value !== '(') {
                    output.push(ops.pop());
                }
                if (ops.length === 0) {
                    throw new Error('Mismatched parentheses');
                }
                ops.pop(); // Remove '('
            }
        }
    }
    while (ops.length > 0) {
        const op = ops.pop();
        if (op.value === '(' || op.value === ')') {
            throw new Error('Mismatched parentheses');
        }
        output.push(op);
    }
    return output;
}
// Evaluate RPN
function evaluateRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        }
        else if (token.type === 'operator') {
            const op = token.value;
            if (isUnaryOperatorFromContext(token, stack)) {
                // Unary operator
                if (stack.length < 1)
                    throw new Error('Invalid expression');
                const a = stack.pop();
                if (op === '+') {
                    stack.push(+a);
                }
                else if (op === '-') {
                    stack.push(-a);
                }
            }
            else {
                // Binary operator
                if (stack.length < 2)
                    throw new Error('Invalid expression');
                const b = stack.pop();
                const a = stack.pop();
                switch (op) {
                    case '+':
                        stack.push(a + b);
                        break;
                    case '-':
                        stack.push(a - b);
                        break;
                    case '*':
                        stack.push(a * b);
                        break;
                    case '/':
                        // Division truncates toward zero
                        stack.push(Math.trunc(a / b));
                        break;
                }
            }
        }
    }
    if (stack.length !== 1)
        throw new Error('Invalid expression');
    return stack[0];
}
function tokenize2(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        if (input[i] === ' ') {
            i++;
            continue;
        }
        if (input[i] === '(' || input[i] === ')') {
            tokens.push({ type: 'paren', value: input[i] });
            i++;
            continue;
        }
        if ('+-*/'.includes(input[i])) {
            const unary = isUnaryToken(tokens, input[i]);
            tokens.push({ type: 'operator', value: input[i], unary });
            i++;
            continue;
        }
        if (/[0-9]/.test(input[i])) {
            let numStr = '';
            while (i < input.length && /[0-9]/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseInt(numStr, 10) });
            continue;
        }
        throw new Error(`Unexpected character: ${input[i]}`);
    }
    return tokens;
}
function isUnaryToken(tokens, op) {
    if (op !== '+' && op !== '-')
        return false;
    if (tokens.length === 0)
        return true;
    const last = tokens[tokens.length - 1];
    if (last.type === 'paren' && last.value === '(')
        return true;
    if (last.type === 'operator')
        return true;
    return false;
}
function getPrecedence2(token) {
    if (token.type === 'operator') {
        if (token.unary) {
            return 4; // Unary + and -
        }
        if (token.value === '*' || token.value === '/') {
            return 3;
        }
        if (token.value === '+' || token.value === '-') {
            return 2;
        }
    }
    return 0;
}
function shuntingYard2(tokens) {
    const output = [];
    const ops = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'number') {
            output.push(token);
        }
        else if (token.type === 'operator') {
            if (token.unary) {
                // Right-associative unary operator
                while (ops.length > 0 && ops[ops.length - 1].type === 'operator' && ops[ops.length - 1].unary && getPrecedence2(ops[ops.length - 1]) >= getPrecedence2(token)) {
                    output.push(ops.pop());
                }
                ops.push(token);
            }
            else {
                // Binary operator
                while (ops.length > 0 && ops[ops.length - 1].type === 'operator' && getPrecedence2(ops[ops.length - 1]) >= getPrecedence2(token)) {
                    output.push(ops.pop());
                }
                ops.push(token);
            }
        }
        else if (token.type === 'paren') {
            if (token.value === '(') {
                ops.push(token);
            }
            else {
                while (ops.length > 0 && ops[ops.length - 1].value !== '(') {
                    output.push(ops.pop());
                }
                if (ops.length === 0) {
                    throw new Error('Mismatched parentheses');
                }
                ops.pop();
            }
        }
    }
    while (ops.length > 0) {
        const op = ops.pop();
        if (op.value === '(' || op.value === ')') {
            throw new Error('Mismatched parentheses');
        }
        output.push(op);
    }
    return output;
}
function evaluateRPN2(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        }
        else if (token.type === 'operator') {
            const op = token.value;
            if (token.unary) {
                if (stack.length < 1)
                    throw new Error('Invalid expression');
                const a = stack.pop();
                if (op === '+') {
                    stack.push(+a);
                }
                else if (op === '-') {
                    stack.push(-a);
                }
            }
            else {
                if (stack.length < 2)
                    throw new Error('Invalid expression');
                const b = stack.pop();
                const a = stack.pop();
                switch (op) {
                    case '+':
                        stack.push(a + b);
                        break;
                    case '-':
                        stack.push(a - b);
                        break;
                    case '*':
                        stack.push(a * b);
                        break;
                    case '/':
                        stack.push(Math.trunc(a / b));
                        break;
                }
            }
        }
    }
    if (stack.length !== 1)
        throw new Error('Invalid expression');
    return stack[0];
}
const tokens = tokenize2(input);
const rpn = shuntingYard2(tokens);
const result = evaluateRPN2(rpn);
console.log(result);
