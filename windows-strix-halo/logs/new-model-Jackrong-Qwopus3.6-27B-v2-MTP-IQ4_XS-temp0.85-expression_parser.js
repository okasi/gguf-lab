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
const TOK = {
    NUMBER: 'NUMBER',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MUL: 'MUL',
    DIV: 'DIV',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    UPLUS: 'UPLUS',
    UMINUS: 'UMINUS',
};
function isOperator(type) {
    return type === TOK.PLUS || type === TOK.MINUS || type === TOK.MUL || type === TOK.DIV || type === TOK.UPLUS || type === TOK.UMINUS;
}
function tokenize(input) {
    const tokens = [];
    let i = 0;
    const len = input.length;
    while (i < len) {
        if (input[i] === ' ') {
            i++;
            continue;
        }
        if (input[i] === '+') {
            const unary = tokens.length === 0 || isOperator(tokens[tokens.length - 1].type) || tokens[tokens.length - 1].type === TOK.LPAREN;
            tokens.push({ type: unary ? TOK.UPLUS : TOK.PLUS });
            i++;
        }
        else if (input[i] === '-') {
            const unary = tokens.length === 0 || isOperator(tokens[tokens.length - 1].type) || tokens[tokens.length - 1].type === TOK.LPAREN;
            tokens.push({ type: unary ? TOK.UMINUS : TOK.MINUS });
            i++;
        }
        else if (input[i] === '*') {
            tokens.push({ type: TOK.MUL });
            i++;
        }
        else if (input[i] === '/') {
            tokens.push({ type: TOK.DIV });
            i++;
        }
        else if (input[i] === '(') {
            tokens.push({ type: TOK.LPAREN });
            i++;
        }
        else if (input[i] === ')') {
            tokens.push({ type: TOK.RPAREN });
            i++;
        }
        else if (input[i] >= '0' && input[i] <= '9') {
            let num = 0;
            while (i < len && input[i] >= '0' && input[i] <= '9') {
                num = num * 10 + (input.charCodeAt(i) - 48);
                i++;
            }
            tokens.push({ type: TOK.NUMBER, value: num });
        }
        else {
            throw new Error('Unexpected character');
        }
    }
    return tokens;
}
function precedence(type) {
    switch (type) {
        case TOK.UPLUS:
        case TOK.UMINUS:
            return 4;
        case TOK.MUL:
        case TOK.DIV:
            return 3;
        case TOK.PLUS:
        case TOK.MINUS:
            return 2;
        default:
            return 0;
    }
}
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    for (const token of tokens) {
        if (token.type === TOK.NUMBER) {
            output.push(token);
        }
        else if (token.type === TOK.LPAREN) {
            stack.push(token);
        }
        else if (token.type === TOK.RPAREN) {
            while (stack.length > 0 && stack[stack.length - 1].type !== TOK.LPAREN) {
                output.push(stack.pop());
            }
            if (stack.length > 0) {
                stack.pop();
            }
        }
        else {
            while (stack.length > 0 && stack[stack.length - 1].type !== TOK.LPAREN && precedence(stack[stack.length - 1].type) >= precedence(token.type)) {
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
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token.type === TOK.NUMBER) {
            stack.push(token.value);
        }
        else if (token.type === TOK.UPLUS) {
            stack.push(+stack.pop());
        }
        else if (token.type === TOK.UMINUS) {
            stack.push(-stack.pop());
        }
        else if (token.type === TOK.PLUS) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
        }
        else if (token.type === TOK.MINUS) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a - b);
        }
        else if (token.type === TOK.MUL) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a * b);
        }
        else if (token.type === TOK.DIV) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(Math.trunc(a / b));
        }
    }
    return stack[0];
}
const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluateRPN(rpn);
console.log(result);
