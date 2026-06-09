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
const input = fs.readFileSync(0, 'utf8').trim();
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    let lastWasNumberOrRParen = false;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                num += expr[i++];
            }
            tokens.push({ type: 'NUMBER', value: num, precedence: -1 });
            lastWasNumberOrRParen = true;
            continue;
        }
        if (ch === '+' || ch === '-') {
            if (!lastWasNumberOrRParen) {
                tokens.push({ type: 'UNARY', value: ch, precedence: 3 });
            }
            else {
                tokens.push({ type: 'BINARY', value: ch, precedence: 1 });
            }
            lastWasNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === '*') {
            tokens.push({ type: 'BINARY', value: '*', precedence: 2 });
            lastWasNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === '/') {
            tokens.push({ type: 'BINARY', value: '/', precedence: 2 });
            lastWasNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === '(') {
            tokens.push({ type: 'LPAREN', value: '(', precedence: -1 });
            lastWasNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: ')', precedence: -1 });
            lastWasNumberOrRParen = true;
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            output.push(token);
        }
        else if (token.type === 'UNARY' || token.type === 'BINARY') {
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top.type === 'UNARY' || top.type === 'BINARY') {
                    if (top.precedence > token.precedence ||
                        (top.precedence === token.precedence && token.type !== 'UNARY')) {
                        output.push(stack.pop());
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            stack.push(token);
        }
        else if (token.type === 'LPAREN') {
            stack.push(token);
        }
        else if (token.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                output.push(stack.pop());
            }
            if (stack.length > 0 && stack[stack.length - 1].type === 'LPAREN') {
                stack.pop();
            }
        }
    }
    while (stack.length > 0) {
        const token = stack.pop();
        if (token.type !== 'LPAREN') {
            output.push(token);
        }
    }
    return output;
}
function evaluate(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token.type === 'NUMBER') {
            stack.push(Number(token.value));
        }
        else if (token.type === 'UNARY') {
            const a = stack.pop();
            if (token.value === '+') {
                stack.push(a);
            }
            else {
                stack.push(-a);
            }
        }
        else if (token.type === 'BINARY') {
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
const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluate(rpn);
console.log(result);
