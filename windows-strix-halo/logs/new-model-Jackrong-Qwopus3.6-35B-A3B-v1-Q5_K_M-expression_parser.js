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
    return parser.parse();
}
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (char === " ") {
            i++;
            continue;
        }
        if (char === "(") {
            tokens.push({ type: "lparen", value: char });
            i++;
            continue;
        }
        if (char === ")") {
            tokens.push({ type: "rparen", value: char });
            i++;
            continue;
        }
        if (char === "+" || char === "-" || char === "*" || char === "/") {
            tokens.push({ type: "operator", value: char });
            i++;
            continue;
        }
        // Number
        let numStr = "";
        while (i < expression.length && (expression[i] >= "0" && expression[i] <= "9")) {
            numStr += expression[i];
            i++;
        }
        if (numStr.length > 0) {
            tokens.push({ type: "number", value: numStr });
        }
    }
    return tokens;
}
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() {
        if (this.pos >= this.tokens.length) {
            return undefined;
        }
        return this.tokens[this.pos];
    }
    consume() {
        const token = this.peek();
        if (token === undefined) {
            throw new Error("Unexpected end of input");
        }
        this.pos++;
        return token;
    }
    parse() {
        return this.parseExpression();
    }
    parseExpression() {
        let left = this.parseTerm();
        while (true) {
            const token = this.peek();
            if (token && token.type === "operator" && (token.value === "+" || token.value === "-")) {
                this.consume();
                const right = this.parseTerm();
                if (token.value === "+") {
                    left = left + right;
                }
                else {
                    left = left - right;
                }
            }
            else {
                break;
            }
        }
        return left;
    }
    parseTerm() {
        let left = this.parseUnary();
        while (true) {
            const token = this.peek();
            if (token && token.type === "operator" && (token.value === "*" || token.value === "/")) {
                this.consume();
                const right = this.parseUnary();
                if (token.value === "*") {
                    left = left * right;
                }
                else {
                    // Division truncates toward zero
                    left = left / right;
                    // Ensure truncation toward zero for negative results
                    if (left > 0) {
                        left = Math.floor(left);
                    }
                    else {
                        left = Math.ceil(left);
                    }
                }
            }
            else {
                break;
            }
        }
        return left;
    }
    parseUnary() {
        const token = this.peek();
        if (token && token.type === "operator" && (token.value === "+" || token.value === "-")) {
            this.consume();
            const operand = this.parseUnary();
            if (token.value === "-") {
                return -operand;
            }
            return operand;
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const token = this.peek();
        if (token === undefined) {
            throw new Error("Unexpected end of input");
        }
        if (token.type === "number") {
            this.consume();
            return parseInt(token.value, 10);
        }
        if (token.type === "lparen") {
            this.consume();
            const result = this.parseExpression();
            const closing = this.consume();
            if (closing.type !== "rparen") {
                throw new Error("Expected ')'");
            }
            return result;
        }
        throw new Error(`Unexpected token: ${token.value}`);
    }
}
const input = fs.readFileSync(0, "utf8").trim();
const result = evaluateExpression(input);
console.log(result);
