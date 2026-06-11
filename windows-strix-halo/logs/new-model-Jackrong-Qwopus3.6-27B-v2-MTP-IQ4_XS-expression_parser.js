"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function evaluate(expression) {
    let tokens = tokenize(expression);
    let index = 0;
    function parseExpression() {
        let result = parseTerm();
        while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
            const operator = tokens[index++];
            const right = parseTerm();
            if (operator === '+') {
                result += right;
            }
            else {
                result -= right;
            }
        }
        return result;
    }
    function parseTerm() {
        let result = parseFactor();
        while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
            const operator = tokens[index++];
            const right = parseFactor();
            if (operator === '*') {
                result *= right;
            }
            else {
                result = Math.trunc(result / right);
            }
        }
        return result;
    }
    function parseFactor() {
        if (tokens[index] === '(') {
            index++; // consume '('
            const result = parseExpression();
            if (tokens[index] === ')') {
                index++; // consume ')'
            }
            return result;
        }
        if (tokens[index] === '+' || tokens[index] === '-') {
            const sign = tokens[index] === '+' ? 1 : -1;
            index++;
            return sign * parseFactor();
        }
        const num = parseInt(tokens[index], 10);
        index++;
        return num;
    }
    return parseExpression();
}
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (char === ' ') {
            i++;
            continue;
        }
        if (char >= '0' && char <= '9') {
            let num = '';
            while (i < expression.length && expression[i] >= '0' && expression[i] <= '9') {
                num += expression[i];
                i++;
            }
            tokens.push(num);
        }
        else {
            tokens.push(char);
            i++;
        }
    }
    return tokens;
}
const input = fs_1.default.readFileSync(0, 'utf8').trim();
if (input) {
    console.log(evaluate(input));
}
