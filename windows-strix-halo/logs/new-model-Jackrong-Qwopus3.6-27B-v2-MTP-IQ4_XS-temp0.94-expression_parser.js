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
    let afterOperand = false;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let s = '';
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                s += expr[i++];
            }
            tokens.push({ kind: 'NUMBER', value: s, prec: -1 });
            afterOperand = true;
            continue;
        }
        if (ch === '+') {
            tokens.push(afterOperand
                ? { kind: 'BINARY', value: '+', prec: 1 }
                : { kind: 'UNARY', value: '+', prec: 4 });
            afterOperand = false;
            i++;
            continue;
        }
        if (ch === '-') {
            tokens.push(afterOperand
                ? { kind: 'BINARY', value: '-', prec: 1 }
                : { kind: 'UNARY', value: '-', prec: 4 });
            afterOperand = false;
            i++;
            continue;
        }
        if (ch === '*') {
            tokens.push({ kind: 'BINARY', value: '*', prec: 2 });
            afterOperand = false;
            i++;
            continue;
        }
        if (ch === '/') {
            tokens.push({ kind: 'BINARY', value: '/', prec: 2 });
            afterOperand = false;
            i++;
            continue;
        }
        if (ch === '(') {
            afterOperand = false;
            tokens.push({ kind: 'LPAREN', value: '(', prec: -1 });
            i++;
            continue;
        }
        if (ch === ')') {
            afterOperand = true;
            tokens.push({ kind: 'RPAREN', value: ')', prec: -1 });
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
    for (const t of tokens) {
        if (t.kind === 'NUMBER') {
            output.push(t);
        }
        else if (t.kind === 'UNARY') {
            stack.push(t);
        }
        else if (t.kind === 'BINARY') {
            while (stack.length > 0
                && stack[stack.length - 1].kind !== 'LPAREN'
                && stack[stack.length - 1].prec >= t.prec) {
                output.push(stack.pop());
            }
            stack.push(t);
        }
        else if (t.kind === 'LPAREN') {
            stack.push(t);
        }
        else if (t.kind === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].kind !== 'LPAREN') {
                output.push(stack.pop());
            }
            if (stack.length > 0)
                stack.pop();
        }
    }
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    return output;
}
function evaluateRPN(rpn) {
    const stack = [];
    for (const t of rpn) {
        if (t.kind === 'NUMBER') {
            stack.push(Number(t.value));
        }
        else if (t.kind === 'UNARY') {
            const a = stack.pop();
            stack.push(t.value === '+' ? a : -a);
        }
        else {
            const b = stack.pop();
            const a = stack.pop();
            switch (t.value) {
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
const result = evaluateRPN(rpn);
console.log(result);
