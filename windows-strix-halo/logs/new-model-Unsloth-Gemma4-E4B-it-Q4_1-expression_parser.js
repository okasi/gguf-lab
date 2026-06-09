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
// --- Lexer ---
class Lexer {
    constructor(input) {
        this.position = 0;
        this.input = input;
    }
    peek() {
        return this.input[this.position] || null;
    }
    advance() {
        const char = this.input[this.position];
        this.position++;
        return char;
    }
    tokenize() {
        const tokens = [];
        while (this.position < this.input.length) {
            let char = this.input[this.position];
            // Skip whitespace
            if (char === ' ') {
                this.position++;
                continue;
            }
            // Handle numbers
            if (char >= '0' && char <= '9') {
                let numStr = '';
                while (this.position < this.input.length &&
                    (this.input[this.position] >= '0' && this.input[this.position] <= '9')) {
                    numStr += this.input[this.position];
                    this.position++;
                }
                tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
                continue;
            }
            // Handle operators and parentheses
            switch (char) {
                case '+':
                    tokens.push({ type: 'PLUS', value: '+' });
                    this.position++;
                    break;
                case '-':
                    tokens.push({ type: 'MINUS', value: '-' });
                    this.position++;
                    break;
                case '*':
                    tokens.push({ type: 'MULTIPLY', value: '*' });
                    this.position++;
                    break;
                case '/':
                    tokens.push({ type: 'DIVIDE', value: '/' });
                    this.position++;
                    break;
                case '(':
                    tokens.push({ type: 'LPAREN', value: '(' });
                    this.position++;
                    break;
                case ')':
                    tokens.push({ type: 'RPAREN', value: ')' });
                    this.position++;
                    break;
                default:
                    throw new Error(`Lexing Error: Unknown character '${char}' at position ${this.position}`);
            }
        }
        tokens.push({ type: 'EOF', value: 0 });
        return tokens;
    }
}
// --- Parser / Evaluator ---
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.current];
    }
    consume(expectedType) {
        const token = this.peek();
        if (token.type !== expectedType) {
            throw new Error(`Parsing Error: Expected ${expectedType} but got ${token.type} (${token.value})`);
        }
        this.current++;
        return token;
    }
    // Top-level entry point
    parse() {
        const result = this.parseExpression();
        this.consume('EOF');
        return result;
    }
    // Handles Addition and Subtraction (lowest precedence: + and -)
    parseExpression() {
        let left = this.parseTerm();
        while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
            const operator = this.peek().type;
            this.current++; // Consume operator
            const right = this.parseTerm();
            if (operator === 'PLUS') {
                left += right;
            }
            else if (operator === 'MINUS') {
                left -= right;
            }
        }
        return left;
    }
    // Handles Multiplication and Division (medium precedence: * and /)
    parseTerm() {
        let left = this.parseFactor();
        while (this.peek().type === 'MULTIPLY' || this.peek().type === 'DIVIDE') {
            const operator = this.peek().type;
            this.current++; // Consume operator
            const right = this.parseFactor();
            if (operator === 'MULTIPLY') {
                left *= right;
            }
            else if (operator === 'DIVIDE') {
                // Division truncates toward zero
                if (right === 0) {
                    throw new Error("Runtime Error: Division by zero");
                }
                left = Math.trunc(left / right);
            }
        }
        return left;
    }
    // Handles numbers, parentheses, and unary operations (highest precedence)
    parseFactor() {
        const token = this.peek();
        let value;
        // 1. Handle Unary Operations (Sign)
        if (token.type === 'MINUS') {
            this.current++; // Consume '-'
            // Recursively parse the next element (which must be a factor/number/parentheses)
            value = -this.parseFactor();
            return value;
        }
        if (token.type === 'PLUS') {
            this.current++; // Consume '+'
            // Recursively parse the next element
            value = this.parseFactor();
            return value;
        }
        // 2. Handle Parentheses
        if (token.type === 'LPAREN') {
            this.current++; // Consume '('
            value = this.parseExpression();
            this.consume('RPAREN'); // Expect ')'
            return value;
        }
        // 3. Handle Numbers
        if (token.type === 'NUMBER') {
            value = token.value;
            this.current++;
            return value;
        }
        throw new Error(`Parsing Error: Unexpected token while parsing factor: ${token.type}`);
    }
}
// --- Main Execution ---
function solve() {
    // Read all input from standard input (fd 0)
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        console.log(0);
        return;
    }
    try {
        // 1. Lexing
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();
        // 2. Parsing and Evaluation
        const parser = new Parser(tokens);
        const result = parser.parse();
        console.log(result);
    }
    catch (e) {
        // In a real application, we might log the error. 
        // For this competitive environment, we might just exit or print a specific error code.
        // Since the prompt requires a clean output, we rely on the input being valid.
        // If an error occurs, the execution will stop.
        process.exit(1);
    }
}
solve();
