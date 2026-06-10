"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const stdin = fs_1.default.readFileSync(0, 'utf8');
const expression = stdin.trim();
// Define the shunting-yard algorithm to convert the expression into postfix notation
function toPostfix(expression) {
    const output = [];
    const stack = [];
    for (const char of expression) {
        if (/\d/.test(char)) {
            output.push(char);
        }
        else if (char === '(') {
            stack.push(char);
        }
        else if (char === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        }
        else if (char === '+' || char === '-' || char === '*' || char === '/') {
            while (stack.length && ((char === '+' || char === '-') && (stack[stack.length - 1] === '*' || stack[stack.length - 1] === '/')) && (char !== '+')) {
                output.push(stack.pop());
            }
            stack.push(char);
        }
    }
    while (stack.length) {
        output.push(stack.pop());
    }
    return output;
}
// Define the evaluation of the postfix notation
function evaluatePostfix(postfix) {
    const stack = [];
    for (const char of postfix) {
        if (/\d/.test(char)) {
            stack.push(parseInt(char));
        }
        else {
            const operand2 = stack.pop();
            const operand1 = stack.pop();
            switch (char) {
                case '+':
                    stack.push(operand1 + operand2);
                    break;
                case '-':
                    stack.push(operand1 - operand2);
                    break;
                case '*':
                    stack.push(operand1 * operand2);
                    break;
                case '/':
                    stack.push(Math.trunc(operand1 / operand2));
                    break;
            }
        }
    }
    return stack[0];
}
const postfix = toPostfix(expression);
const result = evaluatePostfix(postfix);
console.log(result);
