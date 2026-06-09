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
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    let lastTokenType = null;
    while (i < expr.length) {
        const char = expr[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < expr.length && /\d/.test(expr[i])) {
                numStr += expr[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseInt(numStr, 10) });
            lastTokenType = 'number';
            continue;
        }
        if (char === '(' || char === ')') {
            tokens.push({ type: 'parenthesis', value: char });
            lastTokenType = 'parenthesis';
            i++;
            continue;
        }
        if (char === '+' || char === '-' || char === '*' || char === '/') {
            let isUnary = false;
            if ((char === '+' || char === '-') && (lastTokenType === null || lastTokenType === 'operator' || lastTokenType === 'parenthesis')) {
                isUnary = true;
            }
            if (isUnary) {
                tokens.push({ type: 'unary', value: char });
            }
            else {
                tokens.push({ type: 'operator', value: char });
            }
            lastTokenType = 'operator';
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
function getPrecedence(token) {
    if (token.type === 'unary')
        return 3;
    if (token.type === 'operator' && (token.value === '*' || token.value === '/'))
        return 2;
    if (token.type === 'operator' && (token.value === '+' || token.value === '-'))
        return 1;
    return 0;
}
function isRightAssociative(token) {
    if (token.type === 'unary')
        return true;
    return false;
}
function toRPN(tokens) {
    const output = [];
    const opStack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            output.push(token);
        }
        else if (token.type === 'unary') {
            while (opStack.length > 0 &&
                getPrecedence(opStack[opStack.length - 1]) > getPrecedence(token)) {
                output.push(opStack.pop());
            }
            opStack.push(token);
        }
        else if (token.type === 'operator') {
            while (opStack.length > 0 &&
                (getPrecedence(opStack[opStack.length - 1]) > getPrecedence(token) ||
                    (getPrecedence(opStack[opStack.length - 1]) === getPrecedence(token) &&
                        !isRightAssociative(token)))) {
                output.push(opStack.pop());
            }
            opStack.push(token);
        }
        else if (token.type === 'parenthesis') {
            if (token.value === '(') {
                opStack.push(token);
            }
            else {
                while (opStack.length > 0 &&
                    opStack[opStack.length - 1].type !== 'parenthesis') {
                    output.push(opStack.pop());
                }
                if (opStack.length > 0 &&
                    opStack[opStack.length - 1].type === 'parenthesis') {
                    opStack.pop();
                }
            }
        }
    }
    while (opStack.length > 0) {
        output.push(opStack.pop());
    }
    return output;
}
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token.type === 'number') {
            stack.push(token.value);
        }
        else if (token.type === 'unary') {
            const a = stack.pop();
            if (token.value === '+') {
                stack.push(a);
            }
            else {
                stack.push(-a);
            }
        }
        else if (token.type === 'operator') {
            const b = stack.pop();
            const a = stack.pop();
            switch (token.value) {
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
    return stack[0];
}
function main() {
    const expr = fs.readFileSync(0, 'utf8').trim();
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    const result = evaluateRPN(rpn);
    console.log(result);
}
main();
