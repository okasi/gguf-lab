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
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch === '(' || ch === ')' || ch === '*' || ch === '/') {
            tokens.push(ch);
            i++;
            continue;
        }
        if (ch === '+' || ch === '-') {
            const isUnary = tokens.length === 0 || tokens[tokens.length - 1] === '(' || tokens[tokens.length - 1] === '+' || tokens[tokens.length - 1] === '-' || tokens[tokens.length - 1] === '*' || tokens[tokens.length - 1] === '/';
            if (isUnary) {
                tokens.push(ch);
                i++;
                continue;
            }
        }
        let num = '';
        while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9')) {
            num += expr[i];
            i++;
        }
        if (num.length > 0) {
            tokens.push(num);
        }
    }
    return tokens;
}
function precedence(op) {
    if (op === '+' || op === '-')
        return 1;
    if (op === '*' || op === '/')
        return 2;
    return 0;
}
function isAssociativeRight(op) {
    return op === '+' || op === '-';
}
function infixToRPN(tokens) {
    const output = [];
    const opStack = [];
    let lastWasNumberOrParenthesis = false;
    for (const token of tokens) {
        if (token === '(') {
            opStack.push(token);
            lastWasNumberOrParenthesis = false;
        }
        else if (token === ')') {
            while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
                output.push(opStack.pop());
            }
            opStack.pop();
            lastWasNumberOrParenthesis = false;
        }
        else if (token === '+' || token === '-') {
            while (opStack.length > 0 &&
                opStack[opStack.length - 1] !== '(' &&
                !(token === '+' || token === '-') &&
                precedence(opStack[opStack.length - 1]) > precedence(token) &&
                (isAssociativeRight(opStack[opStack.length - 1]) === false || isAssociativeRight(opStack[opStack.length - 1]) !== isAssociativeRight(token))) {
                output.push(opStack.pop());
            }
            while (opStack.length > 0 &&
                opStack[opStack.length - 1] !== '(' &&
                precedence(opStack[opStack.length - 1]) === precedence(token) &&
                isAssociativeRight(opStack[opStack.length - 1]) === false) {
                output.push(opStack.pop());
            }
            opStack.push(token);
            lastWasNumberOrParenthesis = false;
        }
        else if (token === '*' || token === '/') {
            while (opStack.length > 0 &&
                opStack[opStack.length - 1] !== '(' &&
                precedence(opStack[opStack.length - 1]) > precedence(token)) {
                output.push(opStack.pop());
            }
            opStack.push(token);
            lastWasNumberOrParenthesis = false;
        }
        else {
            output.push(token);
            lastWasNumberOrParenthesis = true;
        }
    }
    while (opStack.length > 0) {
        output.push(opStack.pop());
    }
    return output;
}
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token === '+' || token === '-' || token === '*' || token === '/') {
            if (stack.length < 2) {
                throw new Error('Invalid expression');
            }
            const b = stack.pop();
            const a = stack.pop();
            switch (token) {
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
                    if (b === 0) {
                        throw new Error('Division by zero');
                    }
                    stack.push(Math.trunc(a / b));
                    break;
            }
        }
        else {
            stack.push(parseInt(token, 10));
        }
    }
    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }
    return stack[0];
}
function evaluate(expr) {
    const tokens = tokenize(expr);
    const rpn = infixToRPN(tokens);
    return evaluateRPN(rpn);
}
const input = fs.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
