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
// Tokenizer
var TokenType;
(function (TokenType) {
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["PLUS"] = 1] = "PLUS";
    TokenType[TokenType["MINUS"] = 2] = "MINUS";
    TokenType[TokenType["STAR"] = 3] = "STAR";
    TokenType[TokenType["SLASH"] = 4] = "SLASH";
    TokenType[TokenType["LPAREN"] = 5] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 6] = "RPAREN";
})(TokenType || (TokenType = {}));
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch === '+') {
            tokens.push({ type: TokenType.PLUS });
            i++;
        }
        else if (ch === '-') {
            tokens.push({ type: TokenType.MINUS });
            i++;
        }
        else if (ch === '*') {
            tokens.push({ type: TokenType.STAR });
            i++;
        }
        else if (ch === '/') {
            tokens.push({ type: TokenType.SLASH });
            i++;
        }
        else if (ch === '(') {
            tokens.push({ type: TokenType.LPAREN });
            i++;
        }
        else if (ch === ')') {
            tokens.push({ type: TokenType.RPAREN });
            i++;
        }
        else if (/\d/.test(ch)) {
            let num = '';
            while (i < expr.length && /\d/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            tokens.push({ type: TokenType.NUMBER, value: parseInt(num, 10) });
        }
        else {
            throw new Error(`Unexpected character: ${ch}`);
        }
    }
    return tokens;
}
// Shunting-yard algorithm with unary support
function shuntingYard(tokens) {
    const output = [];
    const operators = [];
    function precedence(op) {
        switch (op.type) {
            case TokenType.PLUS:
            case TokenType.MINUS:
                return 1;
            case TokenType.STAR:
            case TokenType.SLASH:
                return 2;
            default:
                return 0;
        }
    }
    function isUnary(op) {
        return op.type === TokenType.MINUS || op.type === TokenType.PLUS;
    }
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === TokenType.NUMBER) {
            output.push(token);
        }
        else if (token.type === TokenType.LPAREN) {
            operators.push(token);
        }
        else if (token.type === TokenType.RPAREN) {
            while (operators.length > 0 && operators[operators.length - 1].type !== TokenType.LPAREN) {
                output.push(operators.pop());
            }
            if (operators.length === 0) {
                throw new Error("Mismatched parentheses");
            }
            operators.pop(); // Remove LPAREN
        }
        else {
            // It's an operator: +, -, *, /
            // Determine if it's unary
            let isUnaryOp = isUnary(token);
            if (isUnaryOp) {
                // Unary operator if it's the first token, or after a left paren, or after another operator
                if (i === 0 ||
                    (tokens[i - 1].type === TokenType.LPAREN) ||
                    (tokens[i - 1].type === TokenType.PLUS || tokens[i - 1].type === TokenType.MINUS || tokens[i - 1].type === TokenType.STAR || tokens[i - 1].type === TokenType.SLASH)) {
                    // It's unary
                    isUnaryOp = true;
                }
                else {
                    isUnaryOp = false;
                }
            }
            if (isUnaryOp) {
                // For unary + and -, we can treat them as having very high precedence
                // But to handle them correctly in shunting-yard, we need a different approach
                // Let's use a marker for unary operators
                // Actually, a common approach is to convert unary minus to a different operator
                // Let's push a special unary operator onto the stack
                // But for simplicity, let's just handle unary by pushing it with high precedence
                // and a special flag. Instead, let's just push it as a normal operator but with higher precedence.
                // Better: push a unary operator token with a marker.
                // Let's just push it as is but with precedence 3 (higher than * and /)
                // But unary + and - should associate right.
                // Let's use a different strategy: push unary operators with a special precedence and right associativity.
                // For unary minus, we can convert it to a negation operation later.
                // For now, let's just push it as an operator with precedence 3.
                const unaryToken = { type: opToUnaryType(token), value: token.value };
                operators.push(unaryToken);
            }
            else {
                // Binary operator
                while (operators.length > 0 && operators[operators.length - 1].type !== TokenType.LPAREN) {
                    const topOp = operators[operators.length - 1];
                    if (topOp.type === TokenType.UNARY_PLUS || topOp.type === TokenType.UNARY_MINUS) {
                        // Unary operators have right associativity, so don't pop them for binary operators
                        break;
                    }
                    if (precedence(topOp) >= precedence(token)) {
                        output.push(operators.pop());
                    }
                    else {
                        break;
                    }
                }
                operators.push(token);
            }
        }
    }
    while (operators.length > 0) {
        const op = operators.pop();
        if (op.type === TokenType.LPAREN) {
            throw new Error("Mismatched parentheses");
        }
        output.push(op);
    }
    return output;
}
function opToUnaryType(token) {
    if (token.type === TokenType.MINUS)
        return TokenType.UNARY_MINUS;
    if (token.type === TokenType.PLUS)
        return TokenType.UNARY_PLUS;
    return token.type;
}
// Evaluate RPN
function evaluateRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
        switch (token.type) {
            case TokenType.NUMBER:
                stack.push(token.value);
                break;
            case TokenType.PLUS:
            case TokenType.MINUS:
            case TokenType.STAR:
            case TokenType.SLASH: {
                if (stack.length < 2) {
                    throw new Error("Invalid expression");
                }
                const b = stack.pop();
                const a = stack.pop();
                switch (token.type) {
                    case TokenType.PLUS:
                        stack.push(a + b);
                        break;
                    case TokenType.MINUS:
                        stack.push(a - b);
                        break;
                    case TokenType.STAR:
                        stack.push(a * b);
                        break;
                    case TokenType.SLASH:
                        if (b === 0) {
                            throw new Error("Division by zero");
                        }
                        stack.push(Math.trunc(a / b));
                        break;
                }
                break;
            }
            case TokenType.UNARY_PLUS:
            case TokenType.UNARY_MINUS: {
                if (stack.length < 1) {
                    throw new Error("Invalid expression");
                }
                const a = stack.pop();
                switch (token.type) {
                    case TokenType.UNARY_PLUS:
                        stack.push(a);
                        break;
                    case TokenType.UNARY_MINUS:
                        stack.push(-a);
                        break;
                }
                break;
            }
            default:
                throw new Error(`Unknown token type: ${token.type}`);
        }
    }
    if (stack.length !== 1) {
        throw new Error("Invalid expression");
    }
    return stack[0];
}
// Main
const tokens = tokenize(input);
const rpnTokens = shuntingYard(tokens);
const result = evaluateRPN(rpnTokens);
console.log(result);
