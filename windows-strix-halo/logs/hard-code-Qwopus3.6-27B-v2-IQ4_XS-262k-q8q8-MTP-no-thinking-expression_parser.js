"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const input = fs_1.default.readFileSync(0, 'utf8').trim();
function tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const ch = str[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
            tokens.push(ch);
            i++;
        }
        else if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < str.length && str[i] >= '0' && str[i] <= '9') {
                num += str[i];
                i++;
            }
            tokens.push(num);
        }
        else {
            throw new Error(`Unexpected character: ${ch}`);
        }
    }
    return tokens;
}
function toRPN(tokens) {
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        '^': 3
    };
    const output = [];
    const stack = [];
    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];
        if (/^\d+$/.test(token)) {
            output.push(token);
        }
        else if (token === '(') {
            stack.push(token);
        }
        else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop(); // Remove '('
        }
        else if (token === '+' || token === '-' || token === '*' || token === '/') {
            // Determine if it is a unary operator
            let isUnary = false;
            if (token === '+' || token === '-') {
                if (i === 0 || tokens[i - 1] === '(') {
                    isUnary = true;
                }
            }
            if (isUnary) {
                // Unary operators have higher precedence than binary
                // For simplicity, we can treat them as having precedence 3
                // However, standard shunting yard usually handles unary by pushing to stack
                // Let's push to stack. Since they are right-associative, we push without popping
                stack.push(token);
            }
            else {
                // Binary operator
                while (stack.length > 0 &&
                    stack[stack.length - 1] !== '(' &&
                    (precedence[stack[stack.length - 1]] > precedence[token] ||
                        (precedence[stack[stack.length - 1]] === precedence[token] && token !== '^'))) {
                    output.push(stack.pop());
                }
                stack.push(token);
            }
        }
        else {
            throw new Error(`Unknown token: ${token}`);
        }
        i++;
    }
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    return output;
}
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (/^\d+$/.test(token)) {
            stack.push(parseInt(token, 10));
        }
        else if (token === '+') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
        }
        else if (token === '-') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a - b);
        }
        else if (token === '*') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a * b);
        }
        else if (token === '/') {
            const b = stack.pop();
            const a = stack.pop();
            // Truncate toward zero
            stack.push(Math.trunc(a / b));
        }
        else {
            throw new Error(`Unknown operator: ${token}`);
        }
    }
    return stack[0];
}
const tokens = tokenize(input);
const rpn = toRPN(tokens);
const result = evaluateRPN(rpn);
console.log(result);
