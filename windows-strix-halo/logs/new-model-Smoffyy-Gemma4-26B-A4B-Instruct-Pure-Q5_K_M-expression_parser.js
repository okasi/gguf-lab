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
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["PLUS"] = 1] = "PLUS";
    TokenType[TokenType["MINUS"] = 2] = "MINUS";
    TokenType[TokenType["MUL"] = 3] = "MUL";
    TokenType[TokenType["DIV"] = 4] = "DIV";
    TokenType[TokenType["LPAREN"] = 5] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 6] = "RPAREN";
    TokenType[TokenType["EOF"] = 7] = "EOF";
})(TokenType || (TokenType = {}));
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < input.length && /\d/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: TokenType.NUMBER, value: parseInt(numStr, 10) });
            continue;
        }
        if (char === '+')
            tokens.push({ type: TokenType.PLUS });
        else if (char === '-')
            tokens.push({ type: TokenType.MINUS });
        else if (char === '*')
            tokens.push({ type: TokenType.MUL });
        else if (char === '/')
            tokens.push({ type: TokenType.DIV });
        else if (char === '(')
            tokens.push({ type: TokenType.LPAREN });
        else if (char === ')')
            tokens.push({ type: TokenType.RPAREN });
        i++;
    }
    tokens.push({ type: TokenType.EOF });
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
    parseExpression() {
        let node = this.parseTerm();
        while (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS) {
            const op = this.consume().type;
            const right = this.parseTerm();
            if (op === TokenType.PLUS) {
                node += right;
            }
            else {
                node -= right;
            }
        }
        return node;
    }
    parseTerm() {
        let node = this.parseUnary();
        while (this.peek().type === TokenType.MUL || this.peek().type === TokenType.DIV) {
            const op = this.consume().type;
            const right = this.parseUnary();
            if (op === TokenType.MUL) {
                node *= right;
            }
            else {
                node = Math.trunc(node / right);
            }
        }
        return node;
    }
    parseUnary() {
        const token = this.peek();
        if (token.type === TokenType.PLUS) {
            this.consume();
            return this.parseUnary();
        }
        else if (token.type === TokenType.MINUS) {
            this.consume();
            return -this.parseUnary();
        }
        else {
            return this.parsePrimary();
        }
    }
    parsePrimary() {
        const token = this.consume();
        if (token.type === TokenType.NUMBER) {
            return token.value;
        }
        else if (token.type === TokenType.LPAREN) {
            const val = this.parseExpression();
            this.consume(); // consume RPAREN
            return val;
        }
        throw new Error('Unexpected token');
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8');
    if (!input.trim())
        return;
    const tokens = tokenize(input);
    const parser = new Parser(tokens);
    const result = parser.parseExpression();
    process.stdout.write(result.toString() + '\n');
}
main();
