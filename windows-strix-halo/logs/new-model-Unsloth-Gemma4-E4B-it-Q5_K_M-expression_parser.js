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
// --- Lexer Implementation ---
class Lexer {
    constructor(input) {
        this.pos = 0;
        this.input = input;
    }
    nextToken() {
        while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
            this.pos++; // Skip whitespace
        }
        if (this.pos >= this.input.length) {
            return null;
        }
        const char = this.input[this.pos];
        if (/[0-9]/.test(char)) {
            let numStr = '';
            while (this.pos < this.input.length && /[0-9]/.test(this.input[this.pos])) {
                numStr += this.input[this.pos];
                this.pos++;
            }
            return { type: 'NUMBER', value: parseInt(numStr, 10) };
        }
        this.pos++;
        switch (char) {
            case '+': return { type: 'PLUS', value: '+' };
            case '-': return { type: 'MINUS', value: '-' };
            case '*': return { type: 'STAR', value: '*' };
            case '/': return { type: 'SLASH', value: '/' };
            case '(': return { type: 'LPAREN', value: '(' };
            case ')': return { type: 'RPAREN', value: ')' };
            default: throw new Error(`Lexer error: Unknown character ${char}`);
        }
    }
}
// --- Parser Implementation ---
class Parser {
    constructor(input) {
        this.currentToken = null;
        this.lexer = new Lexer(input);
        this.nextToken(); // Load the first token
    }
    nextToken() {
        this.currentToken = this.lexer.nextToken();
    }
    consume(expectedType, errorMessage = '') {
        if (!this.currentToken || this.currentToken.type !== expectedType) {
            throw new Error(errorMessage || `Syntax Error: Expected ${expectedType}, but got ${this.currentToken?.type}`);
        }
        const token = this.currentToken;
        this.nextToken(); // Advance to the next token
        return token;
    }
    // Handles numbers and unary signs (+/-)
    parseFactor() {
        let sign = 1;
        // Check for unary plus or minus
        if (this.currentToken && (this.currentToken.type === 'PLUS' || this.currentToken.type === 'MINUS')) {
            const operator = this.currentToken.type;
            this.nextToken(); // Consume the sign
            if (operator === 'MINUS') {
                sign = -1;
            }
        }
        // The next token must be a number or an opening parenthesis
        if (!this.currentToken) {
            throw new Error("Syntax Error: Expected number or '('");
        }
        if (this.currentToken.type === 'NUMBER') {
            const num = this.currentToken.value;
            this.nextToken(); // Consume the number
            return num * sign;
        }
        else if (this.currentToken.type === 'LPAREN') {
            this.consume('LPAREN', "Syntax Error: Expected '('");
            const result = this.parseExpression();
            this.consume('RPAREN', "Syntax Error: Expected ')' after expression");
            return result * sign;
        }
        else {
            throw new Error(`Syntax Error: Expected number or '(' in factor, got ${this.currentToken.type}`);
        }
    }
    // Handles multiplication and division (Precedence level 2)
    parseTerm() {
        let result = this.parseFactor();
        while (this.currentToken && (this.currentToken.type === 'STAR' || this.currentToken.type === 'SLASH')) {
            const operatorToken = this.currentToken;
            this.nextToken(); // Consume operator
            const right = this.parseFactor();
            if (operatorToken.type === 'STAR') {
                result *= right;
            }
            else { // SLASH
                // Division must truncate toward zero
                result = Math.trunc(result / right);
            }
        }
        return result;
    }
    // Handles addition and subtraction (Precedence level 1 - Lowest)
    parseExpression() {
        let result = this.parseTerm();
        while (this.currentToken && (this.currentToken.type === 'PLUS' || this.currentToken.type === 'MINUS')) {
            const operatorToken = this.currentToken;
            this.nextToken(); // Consume operator
            const right = this.parseTerm();
            if (operatorToken.type === 'PLUS') {
                result += right;
            }
            else { // MINUS
                result -= right;
            }
        }
        return result;
    }
    parse() {
        const result = this.parseExpression();
        // Ensure no tokens remain after parsing the main expression
        if (this.currentToken !== null) {
            throw new Error(`Syntax Error: Unexpected token remaining: ${this.currentToken.type}`);
        }
        return result;
    }
}
// --- Main Execution ---
function main() {
    try {
        // Read all input from standard input (file descriptor 0)
        const input = fs.readFileSync(0, "utf8").trim();
        if (input === "") {
            return;
        }
        const parser = new Parser(input);
        const result = parser.parse();
        console.log(result);
    }
    catch (e) {
        // In a production environment, we might handle this gracefully.
        // For this specific problem, we just let the error propagate if the input is invalid.
        // console.error(e.message);
    }
}
main();
