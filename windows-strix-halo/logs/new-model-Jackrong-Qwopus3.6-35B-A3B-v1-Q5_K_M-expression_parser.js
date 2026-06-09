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
// Tokenize the input string
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    const len = expr.length;
    while (i < len) {
        const c = expr[i];
        if (c === ' ') {
            i++;
            continue;
        }
        if (c === '(') {
            tokens.push({ type: 'lparen' });
            i++;
            continue;
        }
        if (c === ')') {
            tokens.push({ type: 'rparen' });
            i++;
            continue;
        }
        if (c === '*' || c === '/') {
            tokens.push({ type: 'op', value: c });
            i++;
            continue;
        }
        if (c === '+' || c === '-') {
            // Check if unary or binary
            // Unary if: at start of expression, or after '(' or after another operator
            if (i === 0 || tokens[tokens.length - 1].type === 'lparen' || tokens[tokens.length - 1].type === 'op' || tokens[tokens.length - 1].type === 'unary_plus' || tokens[tokens.length - 1].type === 'unary_minus') {
                if (c === '+') {
                    tokens.push({ type: 'unary_plus' });
                }
                else {
                    tokens.push({ type: 'unary_minus' });
                }
                i++;
                continue;
            }
            else {
                tokens.push({ type: 'op', value: c });
                i++;
                continue;
            }
        }
        // Number
        let j = i;
        while (j < len && expr[j] !== ' ' && expr[j] !== '+' && expr[j] !== '-' && expr[j] !== '*' && expr[j] !== '/' && expr[j] !== '(' && expr[j] !== ')') {
            j++;
        }
        const numStr = expr.substring(i, j);
        if (numStr !== '') {
            tokens.push({ type: 'number', value: parseInt(numStr, 10) });
        }
        i = j;
    }
    return tokens;
}
// Shunting-yard algorithm to convert infix to postfix
function infixToPostfix(tokens) {
    const output = [];
    const opStack = [];
    const precedence = {
        'unary_plus': 3,
        'unary_minus': 3,
        '*': 2,
        '/': 2,
        '+': 1,
        '-': 1
    };
    const associativity = {
        'unary_plus': 'right',
        'unary_minus': 'right',
        '*': 'left',
        '/': 'left',
        '+': 'left',
        '-': 'left'
    };
    for (const token of tokens) {
        if (token.type === 'number') {
            output.push(token);
        }
        else if (token.type === 'op' || token.type === 'unary_plus' || token.type === 'unary_minus') {
            // While there is an operator on top of the stack that has greater precedence,
            // or (equal precedence and left-associative)
            while (opStack.length > 0) {
                const top = opStack[opStack.length - 1];
                if (top.type === 'op' || top.type === 'unary_plus' || top.type === 'unary_minus') {
                    const topPrecedence = precedence[top.type];
                    const currentPrecedence = precedence[token.type];
                    if (topPrecedence > currentPrecedence ||
                        (topPrecedence === currentPrecedence && associativity[token.type] === 'left')) {
                        output.push(opStack.pop());
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            opStack.push(token);
        }
        else if (token.type === 'lparen') {
            opStack.push(token);
        }
        else if (token.type === 'rparen') {
            while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'lparen') {
                output.push(opStack.pop());
            }
            if (opStack.length > 0 && opStack[opStack.length - 1].type === 'lparen') {
                opStack.pop(); // Remove the left parenthesis
            }
        }
    }
    // Pop remaining operators
    while (opStack.length > 0) {
        output.push(opStack.pop());
    }
    return output;
}
// Evaluate RPN expression
function evaluatePostfix(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        }
        else if (token.type === 'op') {
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
        else if (token.type === 'unary_plus') {
            const a = stack.pop();
            stack.push(a);
        }
        else if (token.type === 'unary_minus') {
            const a = stack.pop();
            stack.push(-a);
        }
    }
    return stack[0];
}
// Main execution
const tokens = tokenize(input);
const postfix = infixToPostfix(tokens);
const result = evaluatePostfix(postfix);
console.log(result);
