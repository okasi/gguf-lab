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
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = 0;
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                num = num * 10 + (expr[i] - '0');
                i++;
            }
            tokens.push({ type: 'NUMBER', value: num });
            continue;
        }
        if (ch === '+') {
            tokens.push({ type: 'PLUS', value: null });
            i++;
            continue;
        }
        if (ch === '-') {
            tokens.push({ type: 'MINUS', value: null });
            i++;
            continue;
        }
        if (ch === '*') {
            tokens.push({ type: 'MULTIPLY', value: null });
            i++;
            continue;
        }
        if (ch === '/') {
            tokens.push({ type: 'DIVIDE', value: null });
            i++;
            continue;
        }
        if (ch === '(') {
            tokens.push({ type: 'LPAREN', value: null });
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: null });
            i++;
            continue;
        }
        // Should not reach here
        i++;
    }
    return tokens;
}
function getPrecedence(type) {
    switch (type) {
        case 'PLUS':
        case 'MINUS':
            return 2;
        case 'MULTIPLY':
        case 'DIVIDE':
            return 3;
        default:
            return 0;
    }
}
function shuntingYard(tokens) {
    const output = [];
    const opStack = [];
    let prevWasOperatorOrLParen = true; // Initially true to mark first +/- as unary
    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            output.push(token);
            prevWasOperatorOrLParen = false;
        }
        else if (token.type === 'PLUS' || token.type === 'MINUS') {
            if (prevWasOperatorOrLParen) {
                // Unary operator
                // Push a special marker for unary
                const unaryToken = { type: token.type, value: null };
                // We need to mark this as unary somehow. Let me use a different approach.
                // Actually, let me use a different token type for unary operators.
                // Wait, the tokenizer doesn't know. Let me handle it in the shunting yard.
                // For unary, I'll use a special representation. Let me store it with a flag.
                // Actually, let me modify the Token type to include an "isUnary" flag.
                // Hmm, let me restructure. Let me add an isUnary property.
                opStack.push({ type: token.type, value: null });
                // Mark as unary - I need a way to do this
                // Let me restructure the approach
            }
            else {
                // Binary operator
                // Pop operators with greater or equal precedence
                while (opStack.length > 0 &&
                    opStack[opStack.length - 1].type !== 'LPAREN' &&
                    getPrecedence(opStack[opStack.length - 1].type) >= getPrecedence(token.type)) {
                    output.push(opStack.pop());
                }
                opStack.push(token);
            }
            prevWasOperatorOrLParen = true;
        }
        else if (token.type === 'MULTIPLY' || token.type === 'DIVIDE') {
            while (opStack.length > 0 &&
                opStack[opStack.length - 1].type !== 'LPAREN' &&
                getPrecedence(opStack[opStack.length - 1].type) >= getPrecedence(token.type)) {
                output.push(opStack.pop());
            }
            opStack.push(token);
            prevWasOperatorOrLParen = true;
        }
        else if (token.type === 'LPAREN') {
            opStack.push(token);
            prevWasOperatorOrLParen = true;
        }
        else if (token.type === 'RPAREN') {
            while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
                output.push(opStack.pop());
            }
            if (opStack.length > 0) {
                opStack.pop(); // Remove LPAREN
            }
            prevWasOperatorOrLParen = false;
        }
    }
    while (opStack.length > 0) {
        output.push(opStack.pop());
    }
    return output;
}
