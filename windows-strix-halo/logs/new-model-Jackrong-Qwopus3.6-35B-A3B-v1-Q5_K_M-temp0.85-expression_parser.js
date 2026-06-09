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
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let j = i;
            while (j < expr.length && expr[j] >= '0' && expr[j] <= '9') {
                j++;
            }
            tokens.push({ type: 'number', value: parseInt(expr.substring(i, j), 10) });
            i = j;
        }
        else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
            const unary = tokens.length === 0 || tokens[tokens.length - 1].type === 'operator' || tokens[tokens.length - 1].type === 'leftParen';
            tokens.push({ type: 'operator', symbol: ch, unary });
            i++;
        }
        else if (ch === '(') {
            tokens.push({ type: 'leftParen' });
            i++;
        }
        else if (ch === ')') {
            tokens.push({ type: 'rightParen' });
            i++;
        }
        else {
            throw new Error(`Unexpected character: ${ch}`);
        }
    }
    return tokens;
}
function getPrecedence(symbol, unary) {
    if (unary)
        return 3;
    if (symbol === '*' || symbol === '/')
        return 2;
    if (symbol === '+' || symbol === '-')
        return 1;
    return 0;
}
function isRightAssociative(symbol, unary) {
    return unary;
}
function toPostfix(tokens) {
    const output = [];
    const opStack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            output.push(token);
        }
        else if (token.type === 'operator') {
            while (opStack.length > 0 &&
                opStack[opStack.length - 1].type === 'operator' &&
                (isRightAssociative(token.symbol, token.unary)
                    ? getPrecedence(token.symbol, token.unary) < getPrecedence(opStack[opStack.length - 1].symbol, opStack[opStack.length - 1].unary)
                    : getPrecedence(token.symbol, token.unary) <= getPrecedence(opStack[opStack.length - 1].symbol, opStack[opStack.length - 1].unary))) {
                output.push(opStack.pop());
            }
            opStack.push(token);
        }
        else if (token.type === 'leftParen') {
            opStack.push(token);
        }
        else if (token.type === 'rightParen') {
            while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'leftParen') {
                output.push(opStack.pop());
            }
            if (opStack.length > 0 && opStack[opStack.length - 1].type === 'leftParen') {
                opStack.pop();
            }
        }
    }
    while (opStack.length > 0) {
        output.push(opStack.pop());
    }
    return output;
}
function evaluatePostfix(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        }
        else if (token.type === 'operator') {
            if (token.unary) {
                const val = stack.pop();
                if (token.symbol === '+') {
                    stack.push(val);
                }
                else if (token.symbol === '-') {
                    stack.push(-val);
                }
            }
            else {
                const b = stack.pop();
                const a = stack.pop();
                if (token.symbol === '+') {
                    stack.push(a + b);
                }
                else if (token.symbol === '-') {
                    stack.push(a - b);
                }
                else if (token.symbol === '*') {
                    stack.push(a * b);
                }
                else if (token.symbol === '/') {
                    stack.push(Math.trunc(a / b));
                }
            }
        }
    }
    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }
    return stack[0];
}
const expression = fs.readFileSync(0, 'utf8').trim();
const tokens = tokenize(expression);
const postfix = toPostfix(tokens);
const result = evaluatePostfix(postfix);
console.log(result);
