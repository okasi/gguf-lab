"use strict";
const fs = require('fs');
/**
 * Defines the precedence rules for operators. Higher number means higher precedence.
 * Unary operators (+/-) have the highest precedence.
 */
const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'U+': 3 // Placeholder for unary operators
};
/**
 * Checks if a token is an operator.
 * @param {string} token
 * @returns {boolean}
 */
function isOperator(token) {
    return ['+', '-', '*', '/'].includes(token);
}
/**
 * Checks if a token is a number (integer).
 * @param {string} token
 * @returns {boolean}
 */
function isNumber(token) {
    // Check if the token can be parsed as an integer.
    return /^-?\d+$/.test(token);
}
/**
 * Determines if a sign (+ or -) is unary based on the context (preceding token).
 * A sign is unary if it is at the start of the expression, or follows an opening parenthesis,
 * or follows another operator.
 * @param {string} currentToken The token being examined.
 * @param {string | null} previousToken The token immediately preceding the current one.
 * @returns {boolean} True if the sign is unary.
 */
function isUnary(currentToken, previousToken) {
    if (currentToken === '+' || currentToken === '-') {
        if (previousToken === null) {
            // Start of expression
            return true;
        }
        if (previousToken === '(' || isOperator(previousToken)) {
            // After opening parenthesis or another operator
            return true;
        }
    }
    return false;
}
/**
 * Tokenizes the input expression string, correctly identifying numbers,
 * binary operators, parentheses, and unary signs.
 * @param {string} expression The input string.
 * @returns {string[]} Array of tokens.
 */
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    let previousToken = null;
    while (i < expression.length) {
        let char = expression[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        // 1. Handle Numbers
        if (/[0-9]/.test(char) || (char === '-' && i + 1 < expression.length && /[0-9]/.test(expression[i + 1]))) {
            let numStr = '';
            let startIndex = i;
            // Handle negative sign if it starts a number
            if (char === '-') {
                numStr += char;
                i++;
            }
            // Read subsequent digits
            while (i < expression.length && /[0-9]/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(numStr);
            previousToken = numStr;
            continue;
        }
        // 2. Handle Parentheses
        if (char === '(' || char === ')') {
            tokens.push(char);
            previousToken = char;
            i++;
            continue;
        }
        // 3. Handle Operators (+, -, *, /)
        if (['+', '-', '*', '/'].includes(char)) {
            let token = char;
            let isUnarySign = false;
            if (char === '+' || char === '-') {
                if (isUnary(char, previousToken)) {
                    // We treat unary signs as a distinct token 'U+' or 'U-' for precedence handling
                    token = 'U' + char;
                    isUnarySign = true;
                }
            }
            tokens.push(token);
            previousToken = token;
            i++;
            continue;
        }
        // If parsing fails (should not happen for valid input)
        i++;
    }
    return tokens;
}
/**
 * Performs the arithmetic operation.
 * Division truncates toward zero, which is standard JavaScript integer division behavior.
 * @param {number} a
 * @param {number} b
 * @param {string} op The operator ('+', '-', '*', '/')
 * @returns {number} The result.
 */
function calculate(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b === 0) {
                throw new Error("Division by zero");
            }
            // Standard division truncates toward zero
            return Math.trunc(a / b);
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}
/**
 * Evaluates the tokenized expression using the Shunting-Yard (or direct stack) logic.
 * We use the direct two-stack evaluation method for simplicity.
 *
 * @param {string[]} tokens The tokenized expression.
 * @returns {number} The final evaluated integer.
 */
function evaluate(tokens) {
    const values = []; // Stack for numbers
    const ops = []; // Stack for operators
    for (const token of tokens) {
        if (isNumber(token)) {
            values.push(parseInt(token, 10));
        }
        else if (token === '(') {
            ops.push(token);
        }
        else if (token === ')') {
            while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                const op = ops.pop();
                const val2 = values.pop();
                const val1 = values.pop();
                values.push(calculate(val1, val2, op));
            }
            if (ops.length === 0 || ops[ops.length - 1] !== '(') {
                throw new Error("Mismatched parentheses");
            }
            ops.pop(); // Pop the '('
        }
        else if (token.startsWith('U')) {
            // Handle Unary operator: Apply the sign to the next number
            if (values.length === 0) {
                // Handle case like '-5' at start
                // We push 0 to handle the initial negative sign correctly (e.g., -5 -> 0 - 5)
                values.push(0);
            }
            const nextNum = parseInt(tokens[tokens.indexOf(token) + 1], 10);
            const sign = token === 'U+' ? 1 : -1;
            values.push(sign * nextNum);
            // Skip the next token since we consumed it
            // (This requires careful index management, simpler approach is to handle unary in the main loop)
        }
        else if (isOperator(token)) {
            const currentOp = token;
            // Handle Unary operators immediately
            if (currentOp.startsWith('U')) {
                // Since we handled the unary operation by modifying the value stack directly,
                // we just push the 'U' operator onto the stack for precedence rules.
                ops.push(currentOp);
                continue;
            }
            // Handle Binary operators
            while (ops.length > 0 && ops[ops.length - 1] !== '(' &&
                precedence[ops[ops.length - 1]] >= precedence[currentOp]) {
                const op = ops.pop();
                const val2 = values.pop();
                const val1 = values.pop();
                values.push(calculate(val1, val2, op));
            }
            ops.push(currentOp);
        }
    }
    // Process remaining operators
    while (ops.length > 0) {
        const op = ops.pop();
        if (op === '(' || op.startsWith('U')) {
            throw new Error("Mismatched parentheses or unary operator remaining");
        }
        const val2 = values.pop();
        const val1 = values.pop();
        values.push(calculate(val1, val2, op));
    }
    if (values.length !== 1) {
        throw new Error("Invalid expression structure");
    }
    return values[0];
}
function main() {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
        return;
    }
    try {
        // 1. Tokenize the expression
        const tokens = tokenize(input);
        // 2. Evaluate the tokens
        const result = evaluate(tokens);
        // 3. Output the result
        console.log(result);
    }
    catch (error) {
        // In a competitive environment, error handling might be minimal,
        // but for robustness, we catch evaluation errors.
        // console.error("Evaluation Error:", error.message);
    }
}
main();
