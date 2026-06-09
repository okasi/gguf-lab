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
        const c = expression[i];
        if (c === ' ') {
            i++;
            continue;
        }
        if (/\d/.test(c)) {
            let num = '';
            while (i < expression.length && /\d/.test(expression[i])) {
                num += expression[i];
                i++;
            }
            tokens.push(num);
            continue;
        }
        if (c === '+' || c === '-') {
            if (i === 0 || tokens.length === 0 || tokens[tokens.length - 1] === '(' || tokens[tokens.length - 1] === '+' || tokens[tokens.length - 1] === '-' || tokens[tokens.length - 1] === '*' || tokens[tokens.length - 1] === '/' || tokens[tokens.length - 1] === 'u+' || tokens[tokens.length - 1] === 'u-') {
                tokens.push(c === '+' ? 'u+' : 'u-');
            }
            else {
                tokens.push(c);
            }
        }
        else if (c === '*' || c === '/') {
            tokens.push(c);
        }
        else if (c === '(') {
            tokens.push('(');
        }
        else if (c === ')') {
            tokens.push(')');
        }
        i++;
    }
    return tokens;
}
function getPrecedence(op) {
    if (op === 'u+' || op === 'u-')
        return 3;
    if (op === '*' || op === '/')
        return 2;
    if (op === '+' || op === '-')
        return 1;
    return 0;
}
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    for (const token of tokens) {
        if (!isNaN(Number(token))) {
            output.push(token);
        }
        else if (token === '(') {
            stack.push(token);
        }
        else if (token === ')') {
            while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop();
        }
        else {
            while (stack.length > 0 && stack[stack.length - 1] !== '(' &&
                (getPrecedence(stack[stack.length - 1]) > getPrecedence(token) ||
                    (getPrecedence(stack[stack.length - 1]) === getPrecedence(token) && token !== 'u+' && token !== 'u-'))) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    }
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    return output;
}
function evaluatePostfix(postfix) {
    const stack = [];
    for (const token of postfix) {
        if (!isNaN(Number(token))) {
            stack.push(Number(token));
        }
        else if (token === 'u+') {
            stack.push(stack.pop());
        }
        else if (token === 'u-') {
            stack.push(-stack.pop());
        }
        else if (token === '+' || token === '-' || token === '*' || token === '/') {
            const b = stack.pop();
            const a = stack.pop();
            if (token === '+')
                stack.push(a + b);
            else if (token === '-')
                stack.push(a - b);
            else if (token === '*')
                stack.push(a * b);
            else
                stack.push(Math.trunc(a / b));
        }
    }
    return stack[0];
}
function evaluate(expression) {
    const tokens = tokenize(expression);
    const postfix = shuntingYard(tokens);
    return evaluatePostfix(postfix);
}
const input = fs.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
