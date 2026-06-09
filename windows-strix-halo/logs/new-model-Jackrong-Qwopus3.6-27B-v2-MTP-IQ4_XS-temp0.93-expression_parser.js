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
const input = fs.readFileSync(0, "utf8").trim();
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    let afterNumberOrRParen = false;
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
            afterNumberOrRParen = true;
            continue;
        }
        if (ch === '+' || ch === '-') {
            const unary = !afterNumberOrRParen;
            tokens.push({
                type: unary ? 'UNARY' : 'BINARY',
                value: ch,
                precedence: unary ? 3 : 1
            });
            afterNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === '*' || ch === '/') {
            tokens.push({
                type: 'BINARY',
                value: ch,
                precedence: 2
            });
            afterNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === '(') {
            tokens.push({ type: 'LPAREN', value: '(', precedence: -1 });
            afterNumberOrRParen = false;
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: ')', precedence: -1 });
            afterNumberOrRParen = true;
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
        else if (token.type === 'UNARY') {
            stack.push(token);
        }
        else if (token.type === 'BINARY') {
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top.type !== 'LPAREN' && top.precedence >= token.precedence) {
                    output.push(stack.pop());
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
            if (stack.length > 0) {
                stack.pop();
            }
        }
    }
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    return output;
}
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token.type === 'NUMBER') {
            stack.push(Number(token.value));
        }
        else if (token.type === 'UNARY') {
            const val = stack.pop();
            if (token.value === '+') {
                stack.push(val);
            }
            else {
                stack.push(-val);
            }
        }
        else if (token.type === 'BINARY') {
            const right = stack.pop();
            const left = stack.pop();
            switch (token.value) {
                case '+':
                    stack.push(left + right);
                    break;
                case '-':
                    stack.push(left - right);
                    break;
                case '*':
                    stack.push(left * right);
                    break;
                case '/':
                    stack.push(Math.trunc(left / right));
                    break;
            }
        }
    }
    return stack[0];
}
const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluateRPN(rpn);
console.log(result);
