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
    TokenType[TokenType["Multiply"] = 3] = "Multiply";
    TokenType[TokenType["Divide"] = 4] = "Divide";
    TokenType[TokenType["LParen"] = 5] = "LParen";
    TokenType[TokenType["RParen"] = 6] = "RParen";
    TokenType[TokenType["EOF"] = 7] = "EOF";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, value = null) {
        this.type = type;
        this.value = value;
    }
}
class Lexer {
    constructor(input) {
        this.pos = 0;
        this.input = input;
    }
    peek() {
        return this.input[this.pos] || null;
    }
    consume() {
        return this.input[this.pos++];
    }
    tokenize() {
        const tokens = [];
        while (this.pos < this.input.length) {
            const char = this.peek();
            if (/\s/.test(char)) {
                this.consume();
                continue;
            }
            if (/\d/.test(char)) {
                let numStr = "";
                while (this.peek() !== null && /\d/.test(this.peek())) {
                    numStr += this.consume();
                }
                tokens.push(new Token(TokenType.Number, parseInt(numStr, 10)));
                continue;
            }
            switch (char) {
                case '+':
                    tokens.push(new Token(TokenType.Plus));
                    break;
                case '-':
                    tokens.push(new Token(TokenType.Minus));
                    break;
                case '*':
                    tokens.push(new Token(TokenType.Multiply));
                    break;
                case '/':
                    tokens.push(new Token(TokenType.Divide));
                    break;
                case '(':
                    tokens.push(new Token(TokenType.LParen));
                    break;
                case ')':
                    tokens.push(new Token(TokenType.RParen));
                    break;
                default:
                    throw new Error(`Unexpected character: ${char}`);
            }
            this.consume();
        }
        tokens.push(new Token(TokenType.EOF));
        return tokens;
    }
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
    expect(type) {
        const token = this.peek();
        if (token.type !== type) {
            throw new Error(`Expected ${TokenType[type]} but got ${TokenType[token.type]}`);
        }
        return this.consume();
    }
    // Expression -> Term { ('+' | '-') Term }
    parseExpression() {
        let node = this.parseTerm();
        while (this.peek().type === TokenType.Plus || this.peek().type === TokenType.Minus) {
            const op = this.consume().type;
            const right = this.parseTerm();
            if (op === TokenType.Plus)
                node += right;
            else
                node -= right;
        }
        return node;
    }
    // Term -> Unary { ('*' | '/') Unary }
    parseTerm() {
        let node = this.parseUnary();
        while (this.peek().type === TokenType.Multiply || this.peek().type === TokenType.Divide) {
            const op = this.consume().type;
            const right = this.parseUnary();
            if (op === TokenType.Multiply) {
                node *= right;
            }
            else {
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }
    // Unary -> ('+' | '-') Unary | Primary
    parseUnary() {
        if (this.peek().type === TokenType.Plus) {
            this.consume();
            return this.parseUnary();
        }
        if (this.peek().type === TokenType.Minus) {
            this.consume();
            return -this.parseUnary();
        }
        return this.parsePrimary();
    }
    // Primary -> Number | '(' Expression ')'
    parsePrimary() {
        const token = this.peek();
        if (token.type === TokenType.Number) {
            this.consume();
            return token.value;
        }
        if (token.type === TokenType.LParen) {
            this.consume();
            const result = this.parseExpression();
            this.expect(TokenType.RParen);
            return result;
        }
        throw new Error(`Unexpected token: ${TokenType[token.type]}`);
    }
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim())
            return;
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const result = parser.parseExpression();
        if (parser.peek().type !== TokenType.EOF) {
            throw new Error("Unexpected tokens after expression");
        }
        process.stdout.write(result.toString() + "\n");
    }
    catch (err) {
        process.exit(1);
    }
}
main();
