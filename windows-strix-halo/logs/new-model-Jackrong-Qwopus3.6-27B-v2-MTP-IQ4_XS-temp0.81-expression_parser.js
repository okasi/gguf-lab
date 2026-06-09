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
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    const precedence = (type, unary) => {
        if (unary && (type === 'PLUS' || type === 'MINUS'))
            return 4;
        if (type === 'MULTIPLY' || type === 'DIVIDE')
            return 3;
        if (type === 'PLUS' || type === 'MINUS')
            return 2;
        return 0;
    };
    const isLeftAssociative = (type) => {
        return true; // All binary operators are left-associative
    };
    // We need to annotate tokens with whether +/- is unary
    // Let's do this during shunting-yard processing
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === 'NUMBER') {
            output.push(token);
        }
        else if (token.type === 'PLUS' || token.type === 'MINUS') {
            // Determine if unary
            const isUnary = (i === 0 ||
                tokens[i - 1].type === 'LPAREN' ||
                tokens[i - 1].type === 'PLUS' ||
                tokens[i - 1].type === 'MINUS' ||
                tokens[i - 1].type === 'MULTIPLY' ||
                tokens[i - 1].type === 'DIVIDE');
            // For unary, we'll just push to stack; they have higher precedence
            // For binary, we follow standard shunting-yard
            while (stack.length > 0 &&
                stack[stack.length - 1].type !== 'LPAREN') {
                const top = stack[stack.length - 1];
                const topIsUnary = /* need to track */ false; // This is tricky
                // Let me rethink this approach
            }
            stack.push(token);
        }
        // ...
    }
}
