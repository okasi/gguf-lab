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
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const ch = input[i];
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = 0;
            while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                num = num * 10 + (input.charCodeAt(i) - 48);
                i++;
            }
            tokens.push({ type: 'NUMBER', value: num });
        }
        else if (ch === '+') {
            tokens.push({ type: 'PLUS' });
            i++;
        }
        else if (ch === '-') {
            tokens.push({ type: 'MINUS' });
            i++;
        }
        else if (ch === '*') {
            tokens.push({ type: 'MULT' });
            i++;
        }
        else if (ch === '/') {
            tokens.push({ type: 'DIV' });
            i++;
        }
        else if (ch === '(') {
            tokens.push({ type: 'LPAREN' });
            i++;
        }
        else if (ch === ')') {
            tokens.push({ type: 'RPAREN' });
            i++;
        }
        else {
            i++;
        }
    }
    return tokens;
}
function isUnaryOperator(tokens, index) {
    if (index === 0)
        return true;
    if (tokens[index - 1].type === 'LPAREN')
        return true;
    const prev = tokens[index - 1].type;
    return prev === 'PLUS' || prev === 'MINUS' || prev === 'MULT' || prev === 'DIV';
}
function getPrecedence(tok) {
    switch (tok.type) {
        case 'MULT':
        case 'DIV': return 2;
        case 'PLUS':
        case 'MINUS': return 1;
        default: return 0;
    }
}
function toRPNType(type) {
    return 'BINARY_' + type;
}
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.type === 'NUMBER') {
            output.push({ type: 'NUMBER', value: tok.value });
        }
        else if (tok.type === 'PLUS' || tok.type === 'MINUS') {
            if (isUnaryOperator(tokens, i)) {
                output.push({ type: tok.type === 'PLUS' ? 'UNARY_PLUS' : 'UNARY_MINUS' });
            }
            else {
                while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN' &&
                    getPrecedence(stack[stack.length - 1]) >= getPrecedence(tok)) {
                    const op = stack.pop();
                    output.push({ type: toRPNType(op.type) });
                }
                stack.push(tok);
            }
        }
        else if (tok.type === 'MULT' || tok.type === 'DIV') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN' &&
                getPrecedence(stack[stack.length - 1]) >= getPrecedence(tok)) {
                const op = stack.pop();
                output.push({ type: toRPNType(op.type) });
            }
            stack.push(tok);
        }
        else if (tok.type === 'LPAREN') {
            stack.push(tok);
        }
        else if (tok.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                const op = stack.pop();
                output.push({ type: toRPNType(op.type) });
            }
            if (stack.length > 0 && stack[stack.length - 1].type === 'LPAREN') {
                stack.pop();
            }
        }
    }
    while (stack.length > 0) {
        const op = stack.pop();
        output.push({ type: toRPNType(op.type) });
    }
    return output;
}
function evaluate(rpn) {
    const stack = [];
    for (const tok of rpn) {
        if (tok.type === 'NUMBER') {
            stack.push(tok.value);
        }
        else if (tok.type === 'UNARY_PLUS') {
            stack.push(+stack.pop());
        }
        else if (tok.type === 'UNARY_MINUS') {
            stack.push(-stack.pop());
        }
        else if (tok.type === 'BINARY_PLUS') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
        }
        else if (tok.type === 'BINARY_MINUS') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a - b);
        }
        else if (tok.type === 'BINARY_MULT') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a * b);
        }
        else if (tok.type === 'BINARY_DIV') {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(Math.trunc(a / b));
        }
    }
    return stack.pop();
}
const input = fs.readFileSync(0, 'utf8').trim();
const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluate(rpn);
console.log(result);
