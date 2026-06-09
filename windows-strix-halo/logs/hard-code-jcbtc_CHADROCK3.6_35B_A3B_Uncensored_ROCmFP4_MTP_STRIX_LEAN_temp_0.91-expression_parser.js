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
function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens);
    return parser.parseExpression();
}
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    const s = expr.trim();
    while (i < s.length) {
        const c = s[i];
        if (c === ' ' || c === '\t') {
            i++;
            continue;
        }
        if (isDigit(c) || c === '.') {
            let num = '';
            while (i < s.length && (isDigit(s[i]) || s[i] === '.')) {
                num += s[i];
                i++;
            }
            tokens.push(num);
        }
        else if (c === '+' || c === '-' || c === '*' || c === '/' || c === '(' || c === ')') {
            // Handle unary + and - by checking context
            if (c === '+' || c === '-') {
                // It's unary if it's at the start or after an operator or opening paren
                if (tokens.length === 0 || isOperatorOrOpenParen(tokens[tokens.length - 1])) {
                    tokens.push(c);
                    i++;
                    continue;
                }
            }
            tokens.push(c);
            i++;
        }
        else {
            i++; // skip unknown chars
        }
    }
    return tokens;
}
function isDigit(c) {
    return c >= '0' && c <= '9';
}
function isOperatorOrOpenParen(token) {
    return ['+', '-', '*', '/', '('].includes(token);
}
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        return this.tokens[this.pos++];
    }
    parseExpression() {
        return this.parseAddSub();
    }
    parseAddSub() {
        let left = this.parseMulDiv();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.parseMulDiv();
            if (op === '+') {
                left = left + right;
            }
            else {
                left = left - right;
            }
        }
        return left;
    }
    parseMulDiv() {
        let left = this.parseUnary();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseUnary();
            if (op === '*') {
                left = left * right;
            }
            else {
                // Truncate toward zero
                left = this.truncateDiv(left, right);
            }
        }
        return left;
    }
    parseUnary() {
        if (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const val = this.parseUnary();
            if (op === '-') {
                return -val;
            }
            else {
                return val;
            }
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const token = this.peek();
        if (!token) {
            throw new Error("Unexpected end of input");
        }
        if (token === '(') {
            this.consume(); // consume '('
            const val = this.parseExpression();
            const close = this.consume(); // consume ')'
            if (close !== ')') {
                throw new Error("Expected ')'");
            }
            return val;
        }
        else if (isDigit(token)) {
            this.consume();
            return parseInt(token, 10);
        }
        else {
            throw new Error(`Unexpected token: ${token}`);
        }
    }
    truncateDiv(a, b) {
        if (b === 0) {
            throw new Error("Division by zero");
        }
        const res = a / b;
        if (res >= 0) {
            return Math.floor(res);
        }
        else {
            return Math.ceil(res);
        }
    }
}
const input = fs.readFileSync(0, "utf8");
try {
    const result = evaluateExpression(input);
    console.log(result);
}
catch (e) {
    console.error(e);
    process.exit(1);
}
