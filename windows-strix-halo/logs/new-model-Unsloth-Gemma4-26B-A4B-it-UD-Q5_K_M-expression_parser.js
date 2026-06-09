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
function tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let numStr = "";
            while (i < str.length && /[0-9]/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            tokens.push({ type: TokenType.Number, value: parseInt(numStr, 10) });
            continue;
        }
        if (char === '+') {
            tokens.push({ type: TokenType.Plus, value: '+' });
            i++;
        }
        else if (char === '-') {
            tokens.push({ type: TokenType.Minus, value: '-' });
            i++;
        }
        else if (char === '*') {
            tokens.push({ type: TokenType.Mul, value: '*' });
            i++;
        }
        else if (char === '/') {
            tokens.push({ type: TokenType.Div, value: '/' });
            i++;
        }
        else if (char === '(') {
            tokens.push({ type: TokenType.LParen, value: '(' });
            i++;
        }
        else if (char === ')') {
            tokens.push({ type: TokenType.RParen, value: ')' });
            i++;
        }
        else {
            i++;
        }
    }
    return tokens;
}
class Parser {
    constructor(tokens) {
        this.pos = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        return this.tokens[this.pos++];
    }
    parse() {
        return this.parseExpression();
    }
    parseExpression() {
        let node = this.parseTerm();
        while (this.peek() && (this.peek().type === TokenType.Plus || this.peek().type === TokenType.Minus)) {
            const op = this.consume().type;
            const right = this.parseTerm();
            if (op === TokenType.Plus)
                node += right;
            else
                node -= right;
        }
        return node;
    }
    parseTerm() {
        let node = this.parseUnary();
        while (this.peek() && (this.peek().type === TokenType.Mul || this.peek().type === TokenType.Div)) {
            const op = this.consume().type;
            const right = this.parseUnary();
            if (op === TokenType.Mul)
                node *= right;
            else
                node = Math.trunc(node / right);
        }
        return node;
    }
    parseUnary() {
        if (this.peek() && (this.peek().type === TokenType.Plus || this.peek().type === TokenType.Minus)) {
            const op = this.consume().type;
            const val = this.parseUnary();
            return op === TokenType.Plus ? val : -val;
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const token = this.consume();
        if (!token)
            throw new Error("Unexpected end of expression");
        if (token.type === TokenType.Number)
            return token.value;
        if (token.type === TokenType.LParen) {
            const val = this.parseExpression();
            const next = this.consume();
            if (!next || next.type !== TokenType.RParen)
                throw new Error("Expected )");
            return val;
        }
        throw new Error("Unexpected token");
    }
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim())
            return;
        const tokens = tokenize(input);
        const parser = new Parser(tokens);
        process.stdout.write(parser.parse().toString() + "\n");
    }
    catch (e) {
        // Error handling is minimal to ensure only result is output
    }
}
main();
