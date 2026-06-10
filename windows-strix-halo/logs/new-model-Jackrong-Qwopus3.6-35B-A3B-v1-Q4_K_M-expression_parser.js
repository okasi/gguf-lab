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
function evaluateExpression(expression) {
    const tokens = [];
    const operators = [];
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };
    const unaryPrecedence = 3;
    let currentToken = '';
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (char === ' ') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            i++;
            continue;
        }
        if (char === '(') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            operators.push('(');
            i++;
            continue;
        }
        if (char === ')') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                const op = operators.pop();
                const b = tokens.pop();
                const a = tokens.pop();
                if (op === '+')
                    tokens.push(a + b);
                else if (op === '-')
                    tokens.push(a - b);
                else if (op === '*')
                    tokens.push(a * b);
                else if (op === '/')
                    tokens.push(Math.trunc(a / b));
            }
            if (operators.length > 0 && operators[operators.length - 1] === '(') {
                operators.pop();
            }
            i++;
            continue;
        }
        if (char === '+' || char === '-' || char === '*' || char === '/') {
            if (currentToken !== '') {
                tokens.push(parseInt(currentToken, 10));
                currentToken = '';
            }
            // Check for unary + or -
            if ((char === '+' || char === '-') && (tokens.length === 0 || operators[operators.length - 1] === '(')) {
                operators.push(char);
                i++;
                continue;
            }
            // Check for precedence
            while (operators.length > 0 && operators[operators.length - 1] !== '(' &&
                precedence[operators[operators.length - 1]] >= precedence[char]) {
                const op = operators.pop();
                const b = tokens.pop();
                const a = tokens.pop();
                if (op === '+')
                    tokens.push(a + b);
                else if (op === '-')
                    tokens.push(a - b);
                else if (op === '*')
                    tokens.push(a * b);
                else if (op === '/')
                    tokens.push(Math.trunc(a / b));
            }
            operators.push(char);
            i++;
            continue;
        }
        currentToken += char;
        i++;
    }
    if (currentToken !== '') {
        tokens.push(parseInt(currentToken, 10));
    }
    while (operators.length > 0) {
        const op = operators.pop();
        if (op === '+' || op === '-' || op === '*' || op === '/') {
            const b = tokens.pop();
            const a = tokens.pop();
            if (op === '+')
                tokens.push(a + b);
            else if (op === '-')
                tokens.push(a - b);
            else if (op === '*')
                tokens.push(a * b);
            else if (op === '/')
                tokens.push(Math.trunc(a / b));
        }
    }
    return tokens[0];
}
const input = fs.readFileSync(0, "utf8").trim();
console.log(evaluateExpression(input));
