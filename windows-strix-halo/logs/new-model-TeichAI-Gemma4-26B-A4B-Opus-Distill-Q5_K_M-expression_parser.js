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
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Plus"] = 1] = "Plus";
    TokenType[TokenType["Minus"] = 2] = "Minus";
    TokenType[TokenType["Mul"] = 3] = "Mul";
    TokenType[TokenType["Div"] = 4] = "Div";
    TokenType[TokenType["LParen"] = 5] = "LParen";
    TokenType[TokenType["RParen"] = 6] = "RParen";
})(TokenType || (TokenType = {}));
var OpType;
(function (OpType) {
    OpType[OpType["Binary"] = 0] = "Binary";
    OpType[OpType["Unary"] = 1] = "Unary";
})(OpType || (OpType = {}));
const precedence = {
    'unary+': 3,
    'unary-': 3,
    '*': 2,
    '/': 2,
    '+': 1,
    '-': 1,
};
function getOpName(type) {
    switch (type) {
        case TokenType.Plus: return '+';
        case TokenType.Minus: return '-';
        case TokenType.Mul: return '*';
        case TokenType.Div: return '/';
        default: return '';
    }
}
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < input.length && /\d/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: TokenType.Number, value: parseInt(numStr, 10) });
            continue;
        }
        if (char === '+') {
            tokens.push({ type: TokenType.Plus });
            i++;
        }
        else if (char === '-') {
            tokens.push({ type: TokenType.Minus });
            i++;
        }
        else if (char === '*') {
            tokens.push({ type: TokenType.Mul });
            i++;
        }
        else if (char === '/') {
            tokens.push({ type: TokenType.Div });
            i++;
        }
        else if (char === '(') {
            tokens.push({ type: TokenType.LParen });
            i++;
        }
        else if (char === ')') {
            tokens.push({ type: TokenType.RParen });
            i++;
        }
        else {
            i++;
        }
    }
    return tokens;
}
function preprocessTokens(tokens) {
    const processed = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        let opType = undefined;
        if (token.type === TokenType.Plus || token.type === TokenType.Minus) {
            const prev = i > 0 ? processed[i - 1] : null;
            const isUnary = !prev || (prev.token.type !== TokenType.Number &&
                prev.token.type !== TokenType.RParen);
            if (isUnary)
                opType = OpType.Unary;
        }
        processed.push({ token, opType });
    }
    return processed;
}
function shuntingYard(tokens) {
    const output = [];
    const stack = [];
    for (const tokenCtx of tokens) {
        const { token, opType } = tokenCtx;
        if (token.type === TokenType.Number) {
            output.push(token.value);
        }
        else if (token.type === TokenType.LParen) {
            stack.push(tokenCtx);
        }
        else if (token.type === TokenType.RParen) {
            while (stack.length > 0 && stack[stack.length - 1].token.type !== TokenType.LParen) {
                output.push(stack.pop());
            }
            stack.pop();
        }
        else {
            const opName = opType === OpType.Unary ? `unary${getOpName(token.type)}` : getOpName(token.type);
            const prec = precedence[opName] || 0;
            while (stack.length > 0 && stack[stack.length - 1].token.type !== TokenType.LParen) {
                const top = stack[stack.length - 1];
                const topOpName = top.opType === OpType.Unary ? `unary${getOpName(top.token.type)}` : getOpName(top.token.type);
                const topPrec = precedence[topOpName] || 0;
                if ((opType === OpType.Unary && prec <= topPrec) || (opType === OpType.Binary && prec < topPrec)) {
                    output.push(stack.pop());
                }
                else {
                    break;
                }
            }
            stack.push(tokenCtx);
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
        if (typeof token === 'number') {
            stack.push(token);
        }
        else {
            const { token: t, opType } = token;
            if (opType === OpType.Unary) {
                const operand = stack.pop();
                if (t.type === TokenType.Plus) {
                    stack.push(operand);
                }
                else if (t.type === TokenType.Minus) {
                    stack.push(-operand);
                }
            }
            else {
                const right = stack.pop();
                const left = stack.pop();
                switch (t.type) {
                    case TokenType.Plus:
                        stack.push(left + right);
                        break;
                    case TokenType.Minus:
                        stack.push(left - right);
                        break;
                    case TokenType.Mul:
                        stack.push(left * right);
                        break;
                    case TokenType.Div:
                        stack.push(Math.trunc(left / right));
                        break;
                }
            }
        }
    }
    return stack[0];
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim())
            return;
        const tokens = tokenize(input.trim());
        const processedTokens = preprocessTokens(tokens);
        const postfix = shuntingYard(processedTokens);
        const result = evaluatePostfix(postfix);
        process.stdout.write(result.toString() + "\n");
    }
    catch (err) { }
}
main();
