"use strict";
const fs = require('fs');
/**
 * A simple Lexer/Tokenizer to break the expression into meaningful tokens.
 * It handles multi-digit numbers, operators, and parentheses.
 * It also attempts to distinguish between binary and unary operators during token creation.
 */
class Tokenizer {
    constructor(expression) {
        this.expression = expression;
        this.tokens = [];
        this.position = 0;
        this.isUnaryContext = true; // Start in a state where the first token might be unary
    }
    peek() {
        return this.expression[this.position];
    }
    advance() {
        this.position++;
    }
    isAtEnd() {
        return this.position >= this.expression.length;
    }
    // Determines if the character is part of a number
    isDigit(char) {
        return char >= '0' && char <= '9';
    }
    tokenize() {
        while (!this.isAtEnd()) {
            let char = this.peek();
            if (/\s/.test(char)) {
                this.advance();
                continue;
            }
            if (this.isDigit(char)) {
                let numStr = '';
                while (!this.isAtEnd() && this.isDigit(this.peek())) {
                    numStr += this.peek();
                    this.advance();
                }
                this.tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
                this.isUnaryContext = false; // After a number, the next operator must be binary
                continue;
            }
            if (['+', '-', '*', '/', '(', ')'].includes(char)) {
                if (char === '+' || char === '-') {
                    // Check for unary operator context
                    if (this.isUnaryContext) {
                        this.tokens.push({ type: 'UNARY_OP', value: char });
                        // Unary operators maintain the unary context for the next token
                        continue;
                    }
                }
                // Binary operator
                this.tokens.push({ type: 'OPERATOR', value: char });
                this.isUnaryContext = true; // After a binary operator, the next token might be unary
                this.advance();
                continue;
            }
            throw new Error(`Invalid character in expression: ${char}`);
        }
    }
    getTokens() {
        this.tokenize();
        return this.tokens;
    }
}
/**
 * Evaluator implementation using the Shunting-Yard principle implicitly
 * via Recursive Descent Parsing.
 */
class ExpressionEvaluator {
    constructor(expression) {
        this.tokenizer = new Tokenizer(expression);
        this.tokens = this.tokenizer.getTokens();
        this.tokenIndex = 0;
    }
    peekToken() {
        return this.tokens[this.tokenIndex];
    }
    consume(expectedType = null, expectedValue = null) {
        const token = this.peekToken();
        if (!token) {
            throw new Error("Unexpected end of expression.");
        }
        if (expectedType && token.type !== expectedType) {
            throw new Error(`Expected token type ${expectedType}, but got ${token.type}`);
        }
        if (expectedValue && token.value !== expectedValue) {
            throw new Error(`Expected token value ${expectedValue}, but got ${token.value}`);
        }
        this.tokenIndex++;
        return token;
    }
    // Handles highest precedence items: numbers, parentheses, and unary operators
    parseFactor() {
        const token = this.peekToken();
        if (!token) {
            throw new Error("Unexpected end of expression while parsing factor.");
        }
        if (token.type === 'NUMBER') {
            this.consume('NUMBER');
            return token.value;
        }
        if (token.type === 'UNARY_OP') {
            const unaryOp = this.consume('UNARY_OP');
            const operand = this.parseFactor(); // Factor can be nested
            if (unaryOp.value === '-') {
                return -operand;
            }
            if (unaryOp.value === '+') {
                return operand;
            }
        }
        if (token.value === '(') {
            this.consume('(', '(');
            const result = this.parseExpression();
            this.consume(')', ')');
            return result;
        }
        throw new Error(`Unexpected token in factor: ${JSON.stringify(token)}`);
    }
    // Handles multiplication and division
    parseTerm() {
        let result = this.parseFactor();
        while (this.peekToken() && this.peekToken().type === 'OPERATOR' &&
            (this.peekToken().value === '*' || this.peekToken().value === '/')) {
            const operatorToken = this.consume('OPERATOR');
            const right = this.parseFactor();
            if (operatorToken.value === '*') {
                result *= right;
            }
            else if (operatorToken.value === '/') {
                // Division truncates toward zero (Math.trunc behavior)
                result /= right;
            }
        }
        return result;
    }
    // Handles addition and subtraction (lowest precedence)
    parseExpression() {
        let result = this.parseTerm();
        while (this.peekToken() && this.peekToken().type === 'OPERATOR' &&
            (this.peekToken().value === '+' || this.peekToken().value === '-')) {
            const operatorToken = this.consume('OPERATOR');
            const right = this.parseTerm();
            if (operatorToken.value === '+') {
                result += right;
            }
            else if (operatorToken.value === '-') {
                result -= right;
            }
        }
        return result;
    }
    evaluate() {
        if (this.tokens.length === 0) {
            return 0;
        }
        const result = this.parseExpression();
        if (this.tokenIndex !== this.tokens.length) {
            throw new Error(`Parsing finished early. Remaining tokens starting at index ${this.tokenIndex}: ${JSON.stringify(this.tokens.slice(this.tokenIndex))}`);
        }
        return result;
    }
}
function solve() {
    // Read all input from standard input
    const input = fs.readFileSync(0, "utf8").trim();
    if (input === "") {
        console.log(0);
        return;
    }
    try {
        const evaluator = new ExpressionEvaluator(input);
        const result = evaluator.evaluate();
        console.log(result);
    }
    catch (e) {
        // In a competitive programming context, usually error handling is minimized,
        // but for robustness, we catch parsing errors.
        // console.error("Error during evaluation:", e.message);
        // Depending on strict requirements, we might throw or output an error indicator.
        // For this problem, we assume valid input format.
        // console.log("Error");
    }
}
solve();
