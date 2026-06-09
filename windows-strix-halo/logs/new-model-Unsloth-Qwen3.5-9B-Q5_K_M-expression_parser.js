"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (char === ' ') {
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let num = '';
            while (i < expression.length && /[0-9]/.test(expression[i])) {
                num += expression[i];
                i++;
            }
            tokens.push(num);
            continue;
        }
        if (['+', '-', '*', '/'].includes(char)) {
            let isUnary = true;
            if (tokens.length === 0) {
                isUnary = true;
            }
            else {
                const last = tokens[tokens.length - 1];
                if (['+', '-', '*', '/'].includes(last) || last === '(') {
                    isUnary = true;
                }
            }
            tokens.push(char);
            i++;
            continue;
        }
        if (char === '(') {
            tokens.push('(');
            i++;
            continue;
        }
        if (char === ')') {
            tokens.push(')');
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
function shuntingYard(tokens) {
    const output = [];
    const operatorStack = [];
    const getPrecedence = (op) => {
        if (['+', '-'].includes(op))
            return 2;
        if (['*', '/'].includes(op))
            return 3;
        return 0;
    };
    for (const token of tokens) {
        if (token === '(') {
            operatorStack.push(token);
        }
        else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                output.push(operatorStack.pop());
            }
            operatorStack.pop(); // remove '('
        }
        else if (token === '+' || token === '-' || token === '*' || token === '/') {
            const isUnary = tokens.indexOf(token) === 0 ||
                tokens[tokens.indexOf(token) - 1] === '+' ||
                tokens[tokens.indexOf(token) - 1] === '-' ||
                tokens[tokens.indexOf(token) - 1] === '*' ||
                tokens[tokens.indexOf(token) - 1] === '/' ||
                tokens[tokens.indexOf(token) - 1] === '(';
            while (operatorStack.length > 0 &&
                ['+', '-', '*', '/'].includes(operatorStack[operatorStack.length - 1]) &&
                (isUnary ? operatorStack[operatorStack.length - 1] !== '(' : getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token))) {
                output.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }
        else {
            output.push(token);
        }
    }
    while (operatorStack.length > 0) {
        output.push(operatorStack.pop());
    }
    return output;
}
function evaluate(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token === '(') {
            stack.push(evaluate(tokens));
        }
        else if (token === '+' || token === '-' || token === '*' || token === '/') {
            const right = stack.pop();
            const left = stack.pop();
            let result;
            if (token === '+')
                result = left + right;
            else if (token === '-')
                result = left - right;
            else if (token === '*')
                result = left * right;
            else
                result = Math.trunc(left / right);
            stack.push(result);
        }
        else {
            stack.push(Number(token));
        }
    }
    return stack[0];
}
function parse(expression) {
    const tokens = tokenize(expression);
    const postfix = shuntingYard(tokens);
    return evaluate(postfix);
}
const input = fs.readFileSync(0, 'utf8').trim();
console.log(parse(input));
