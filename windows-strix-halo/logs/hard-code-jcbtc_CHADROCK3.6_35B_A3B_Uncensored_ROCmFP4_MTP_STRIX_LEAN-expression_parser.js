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
    const tokens = tokenize(expression);
    const parser = new Parser(tokens);
    return parser.parseExpression();
}
function tokenize(input) {
    const tokens = [];
    let i = 0;
    const s = input.trim();
    while (i < s.length) {
        if (s[i] === " ") {
            i++;
            continue;
        }
        if (s[i] === "(") {
            tokens.push("(");
            i++;
        }
        else if (s[i] === ")") {
            tokens.push(")");
            i++;
        }
        else if (s[i] === "+" || s[i] === "-" || s[i] === "*" || s[i] === "/") {
            // Check if it's unary
            if (s[i] === "+" || s[i] === "-") {
                // Unary if it's the first token, or after an operator or opening paren
                const isUnary = tokens.length === 0 ||
                    tokens[tokens.length - 1] === "(" ||
                    isOperator(tokens[tokens.length - 1]);
                if (isUnary) {
                    // Consume the sign
                    let sign = s[i];
                    i++;
                    // Skip spaces after sign
                    while (i < s.length && s[i] === " ")
                        i++;
                    // Next must be a number
                    if (i < s.length && (s[i] >= "0" && s[i] <= "9" || s[i] === "(")) {
                        if (sign === "-") {
                            // We'll handle the sign by prepending a negative number or using a unary op
                            // Let's just push the sign as part of the number parsing logic or as a unary operator
                            // Simpler: push a unary operator token
                            tokens.push(sign);
                        }
                        else {
                            // unary +, just skip
                        }
                    }
                    else {
                        // Unexpected
                        throw new Error("Unexpected token after unary operator");
                    }
                    continue;
                }
            }
            tokens.push(s[i]);
            i++;
        }
        else if (s[i] >= "0" && s[i] <= "9") {
            let num = "";
            while (i < s.length && s[i] >= "0" && s[i] <= "9") {
                num += s[i];
                i++;
            }
            tokens.push(num);
        }
        else {
            throw new Error(`Unexpected character: ${s[i]}`);
        }
    }
    return tokens;
}
function isOperator(op) {
    return op === "+" || op === "-" || op === "*" || op === "/";
}
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : undefined;
    }
    consume() {
        const token = this.tokens[this.pos];
        this.pos++;
        return token;
    }
    parseExpression() {
        return this.parseAddSub();
    }
    parseAddSub() {
        let left = this.parseMulDiv();
        while (this.peek() === "+" || this.peek() === "-") {
            const op = this.consume();
            const right = this.parseMulDiv();
            if (op === "+") {
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
        while (this.peek() === "*" || this.peek() === "/") {
            const op = this.consume();
            const right = this.parseUnary();
            if (op === "*") {
                left = left * right;
            }
            else {
                // Division truncates toward zero
                left = left / right;
                if (left > 0) {
                    left = Math.floor(left);
                }
                else {
                    left = Math.ceil(left);
                }
            }
        }
        return left;
    }
    parseUnary() {
        if (this.peek() === "-") {
            this.consume();
            const val = this.parseUnary();
            return -val;
        }
        if (this.peek() === "+") {
            this.consume();
            return this.parseUnary();
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const token = this.peek();
        if (token === undefined) {
            throw new Error("Unexpected end of input");
        }
        if (token === "(") {
            this.consume(); // consume (
            const val = this.parseExpression();
            if (this.peek() !== ")") {
                throw new Error("Expected ')'");
            }
            this.consume(); // consume )
            return val;
        }
        if (token === "-" || token === "+" || token === "*" || token === "/") {
            // This case is handled by parseUnary, but if we get here, it's an error
            throw new Error(`Unexpected operator: ${token}`);
        }
        // Must be a number
        if (!/^-?\d+$/.test(token)) {
            throw new Error(`Invalid number: ${token}`);
        }
        this.consume();
        return parseInt(token, 10);
    }
}
const input = fs.readFileSync(0, "utf8").trim();
const result = evaluateExpression(input);
console.log(result);
