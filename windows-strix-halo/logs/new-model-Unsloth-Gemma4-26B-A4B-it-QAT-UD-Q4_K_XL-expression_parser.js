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
/**
 * Implementation of the Shunting-Yard algorithm to convert infix to postfix
 * and then evaluate the postfix expression.
 */
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Plus"] = 1] = "Plus";
    TokenType[TokenType["Minus"] = 2] = "Minus";
    TokenType[TokenType["Multiply"] = 3] = "Multiply";
    TokenType[TokenType["Divide"] = 4] = "Divide";
    TokenType[TokenType["LParen"] = 5] = "LParen";
    TokenType[TokenType["RParen"] = 6] = "RParen";
    TokenType[TokenType["UnaryPlus"] = 7] = "UnaryPlus";
    TokenType[TokenType["UnaryMinus"] = 8] = "UnaryMinus";
})(TokenType || (TokenType = {}));
function tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < str.length && /\d/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            tokens.push({ type: TokenType.Number, value: parseInt(numStr, 10) });
            continue;
        }
        switch (char) {
            case '+':
                tokens.push({ type: TokenType.Plus });
                break;
            case '-':
                tokens.push({ type: TokenType.Minus });
                break;
            case '*':
                tokens.push({ type: TokenType.Multiply });
                break;
            case '/':
                tokens.push({ type: TokenType.Divide });
                break;
            case '(':
                tokens.push({ type: TokenType.LParen });
                break;
            case ')':
                tokens.push({ type: TokenType.RParen });
                break;
            default: throw new Error(`Unknown character: ${char}`);
        }
        i++;
    }
    return tokens;
}
function parseTokens(tokens) {
    const processed = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const prev = processed[processed.length - 1];
        if (token.type === TokenType.Plus || token.type === TokenType.Minus) {
            // Check if this is a unary operator
            // It is unary if it's at the start or preceded by an operator or '('
            const isUnary = !prev || prev.type === TokenType.Plus ||
                prev.type === TokenType.Minus ||
                prev.type === TokenType.Multiply ||
                prev.type === TokenType.Divide ||
                prev.type === TokenType.LParen;
            if (isUnary) {
                processed.push({ type: token.type === TokenType.Plus ? TokenType.UnaryPlus : TokenType.UnaryMinus });
                continue;
            }
        }
        processed.push(token);
    }
    return processed;
}
function evaluate(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    const precedence = {
        [TokenType.UnaryPlus]: 3,
        [TokenType.UnaryMinus]: 3,
        [TokenType.Multiply]: 2,
        [TokenType.Divide]: 2,
        [TokenType.Plus]: 1,
        [TokenType.Minus]: 1,
        [TokenType.Number]: 0,
        [TokenType.LParen]: 0,
        [TokenType.RParen]: 0
    };
    const isUnary = (t) => t.type === TokenType.UnaryPlus || t.type === TokenType.UnaryMinus;
    for (const token of tokens) {
        if (token.type === TokenType.Number) {
            outputQueue.push(token.value);
        }
        else if (token.type === TokenType.LParen) {
            operatorStack.push(token);
        }
        else if (token.type === TokenType.RParen) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                applyOperator(operatorStack.pop(), outputQueue);
            }
            operatorStack.pop(); // Remove LParen
        }
        else {
            // Operator
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === TokenType.LParen)
                    break;
                const p1 = precedence[token.type];
                const p2 = precedence[top.type];
                // Unary operators are right-associative in logic here (high precedence)
                if (isUnary(token)) {
                    if (p1 < p2)
                        applyOperator(operatorStack.pop(), outputQueue);
                    else
                        break;
                }
                else {
                    if (p1 <= p2)
                        applyOperator(operatorStack.pop(), outputQueue);
                    else
                        break;
                }
            }
            operatorStack.push(token);
        }
    }
    while (operatorStack.length > 0) {
        applyOperator(operatorStack.pop(), outputQueue);
    }
    return outputQueue[0];
}
function applyOperator(token, stack) {
    if (token.type === TokenType.UnaryPlus) {
        stack.push(stack.pop());
    }
    else if (token.type === TokenType.UnaryMinus) {
        stack.push(-stack.pop());
    }
    else {
        const b = stack.pop();
        const a = stack.pop();
        switch (token.type) {
            case TokenType.Plus:
                stack.push(a + b);
                break;
            case TokenType.Minus:
                stack.push(a - b);
                break;
            case TokenType.Multiply:
                stack.push(a * b);
                break;
            case TokenType.Divide:
                const res = a / b;
                stack.push(res >= 0 ? Math.trunc(res) : Math.ceil(res));
                // Note: Math.trunc handles "truncate toward zero" for all numbers
                // but since we are dealing with safe integers, standard truncation is:
                // stack.push(a / b | 0); // This works for 32-bit, but for safe integers:
                // stack.push(Math.trunc(a / b));
                break;
            default: throw new Error("Invalid operator");
        }
    }
}
// Re-implementing applyOperator specifically for safe integer truncation
function applyOperatorCorrect(token, stack) {
    if (token.type === TokenType.UnaryPlus) {
        stack.push(stack.pop());
    }
    else if (token.type === TokenType.UnaryMinus) {
        stack.push(-stack.pop());
    }
    else {
        const b = stack.pop();
        const a = stack.pop();
        switch (token.type) {
            case TokenType.Plus:
                stack.push(a + b);
                break;
            case TokenType.Minus:
                stack.push(a - b);
                break;
            case TokenType.Multiply:
                stack.push(a * b);
                break;
            case TokenType.Divide: {
                const res = a / b;
                stack.push(Math.trunc(res));
                break;
            }
            default: throw new Error("Invalid operator");
        }
    }
}
// Fix the loop to use the correct apply function
function evaluateFixed(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    const precedence = {
        [TokenType.Number]: 0,
        [TokenType.Plus]: 1,
        [TokenType.Minus]: 1,
        [TokenType.Multiply]: 2,
        [TokenType.Divide]: 2,
        [TokenType.UnaryPlus]: 3,
        [TokenType.UnaryMinus]: 3,
        [TokenType.LParen]: 0,
        [TokenType.RParen]: 0
    };
    for (const token of tokens) {
        if (token.type === TokenType.Number) {
            outputQueue.push(token.value);
        }
        else if (token.type === TokenType.LParen) {
            operatorStack.push(token);
        }
        else if (token.type === TokenType.RParen) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                applyOperatorCorrect(operatorStack.pop(), outputQueue);
            }
            operatorStack.pop();
        }
        else {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                const top = operatorStack[operatorStack.length - 1];
                const pTop = precedence[top.type];
                const pCurr = precedence[token.type];
                // If current is unary, it has higher precedence than everything except other unaries.
                // Standard shunting yard: if current is left-assoc and pCurr <= pTop, pop.
                // Unary is right-assoc.
                const isCurrUnary = token.type === TokenType.UnaryPlus || token.type === TokenType.UnaryMinus;
                if (!isCurrUnary && pCurr <= pTop) {
                    applyOperatorCorrect(operatorStack.pop(), outputQueue);
                }
                else if (isCurrUnary && pCurr < pTop) {
                    applyOperatorCorrect(operatorStack.pop(), outputQueue);
                }
                else {
                    break;
                }
            }
            operatorStack.push(token);
        }
    }
    while (operatorStack.length > 0) {
        applyOperatorCorrect(operatorStack.pop(), outputQueue);
    }
    return outputQueue[0];
}
function main() {
    const input = fs.readFileSync(0, "utf8");
    if (!input.trim())
        return;
    const tokens = parseTokens(tokenize(input));
    console.log(evaluateFixed(tokens).toString());
}
main();
