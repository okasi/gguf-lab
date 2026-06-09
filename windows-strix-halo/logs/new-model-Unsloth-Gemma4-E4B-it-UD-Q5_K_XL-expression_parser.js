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
/**
 * Lexer/Tokenizer: Breaks the input string into tokens.
 * Handles numbers and operators.
 */
class Tokenizer {
    constructor(input) {
        this.position = 0;
        this.input = input.replace(/\s/g, ''); // Remove all spaces
    }
    tokenize() {
        const tokens = [];
        while (this.position < this.input.length) {
            let char = this.input[this.position];
            if (/\d/.test(char)) {
                let value = '';
                while (this.position < this.input.length && /\d/.test(this.input[this.position])) {
                    value += this.input[this.position];
                    this.position++;
                }
                tokens.push({ type: 'NUMBER', value: parseInt(value, 10) });
                continue;
            }
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
                    tokens.push({ type: 'STAR', value: '*' });
                    this.position++;
                    break;
                case '/':
                    tokens.push({ type: 'SLASH', value: '/' });
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
                    // Should not happen based on problem constraints
                    throw new Error('Invalid character encountered: ' + char);
            }
        }
        tokens.push({ type: 'EOF', value: null });
        return tokens;
    }
}
/**
 * Parser/Evaluator: Uses Recursive Descent to evaluate the token stream.
 * Grammar:
 * Expression -> Term { ('+' | '-') Term }
 * Term       -> Factor { ('*' | '/') Factor }
 * Factor     -> NUMBER | '(' Expression ')' | ('+' | '-') Factor
 */
class ExpressionEvaluator {
    constructor(tokens) {
        this.position = 0;
        this.tokens = tokens;
    }
    consume(expectedType) {
        const token = this.tokens[this.position];
        if (!token || token.type !== expectedType) {
            throw new Error(`Syntax Error: Expected ${expectedType} but found ${token ? token.type : 'EOF'}`);
        }
        this.position++;
        return token;
    }
    evaluate() {
        const result = this.parseExpression();
        // Ensure we consumed all tokens (except EOF marker)
        this.consume('EOF');
        return result;
    }
    // Handles addition and subtraction (lowest precedence)
    parseExpression() {
        let result = this.parseTerm();
        while (this.tokens[this.position] && (this.tokens[this.position].type === 'PLUS' || this.tokens[this.position].type === 'MINUS')) {
            const operatorToken = this.tokens[this.position];
            this.position++;
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
    // Handles multiplication and division (medium precedence)
    parseTerm() {
        let result = this.parseFactor();
        while (this.tokens[this.position] && (this.tokens[this.position].type === 'STAR' || this.tokens[this.position].type === 'SLASH')) {
            const operatorToken = this.tokens[this.position];
            this.position++;
            const right = this.parseFactor();
            if (operatorToken.type === 'STAR') {
                result *= right;
            }
            else { // SLASH
                if (right === 0) {
                    throw new Error("Division by zero");
                }
                // Truncate towards zero
                result = Math.trunc(result / right);
            }
        }
        return result;
    }
    // Handles numbers, parentheses, and unary operations (highest precedence)
    parseFactor() {
        const token = this.tokens[this.position];
        if (!token) {
            throw new Error("Unexpected end of expression");
        }
        // Unary operators: + or -
        if (token.type === 'PLUS' || token.type === 'MINUS') {
            const operatorToken = this.tokens[this.position];
            this.position++; // Consume the unary operator
            let value = this.parseFactor(); // Recursively parse the operand
            if (operatorToken.type === 'MINUS') {
                return -value;
            }
            else { // PLUS
                return value;
            }
        }
        // Parenthesized expression
        if (token.type === 'LPAREN') {
            this.position++; // Consume '('
            const result = this.parseExpression();
            this.consume('RPAREN'); // Must find ')'
            return result;
        }
        // Number
        if (token.type === 'NUMBER') {
            this.position++;
            return token.value;
        }
        throw new Error(`Invalid factor starting at token: ${token.type}`);
    }
}
function main() {
    try {
        // Read input from standard input (file descriptor 0)
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input) {
            console.log(0);
            return;
        }
        // 1. Tokenize
        const tokenizer = new Tokenizer(input);
        const tokens = tokenizer.tokenize();
        // 2. Evaluate
        const evaluator = new ExpressionEvaluator(tokens);
        const result = evaluator.evaluate();
        console.log(result);
    }
    catch (e) {
        // In a competitive programming environment, we usually just crash or handle specific required errors.
        // For robustness, we log the error, but based on constraints, we assume valid input format.
        if (e instanceof Error) {
            // console.error(e.message);
        }
    }
}
main();
