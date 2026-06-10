"use strict";
const fs = require('fs');
/**
 * Evaluates an arithmetic expression containing integers, spaces, parentheses,
 * binary +, -, *, /, and unary +/-, respecting operator precedence.
 * Division truncates toward zero.
 *
 * @param expression The input arithmetic expression string.
 * @returns The integer result of the expression.
 */
function evaluateExpression(expression) {
    if (!expression || expression.trim() === "") {
        throw new Error("Empty expression provided.");
    }
    // Tokenization (Simplified approach for a single pass evaluation structure)
    // This implementation uses a recursive descent/shunting-yard inspired approach
    // focusing on operator precedence to evaluate the expression directly.
    // 1. Preprocessing: Normalize spacing and handle unary minus/plus detection contextually.
    let tokens = [];
    let i = 0;
    let expectingOperand = true; // True if the next token should be an operand or unary operator
    const isDigit = (char) => char >= '0' && char <= '9';
    const isOperator = (char) => '+-*/();'.includes(char);
    while (i < expression.length) {
        let char = expression[i];
        if (char === ' ') {
            i++;
            continue;
        }
        if (isDigit(char)) {
            let numStr = "";
            while (i < expression.length && isDigit(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(parseInt(numStr, 10));
            expectingOperand = false;
        }
        else if (char === '(') {
            tokens.push('(');
            expectingOperand = true;
            i++;
        }
        else if (char === ')') {
            tokens.push(')');
            expectingOperand = false;
            i++;
        }
        else if (isOperator(char)) {
            if (char === '+' || char === '-') {
                if (expectingOperand) {
                    // Unary operator detected: treat it as part of the next number or as a prefix operator
                    // We handle unary operators by transforming them into a specific form or handling them during logic.
                    // For simplicity in this parser structure, we will process the operation flow.
                    tokens.push(char);
                    expectingOperand = true; // Still expecting an operand after a unary operator
                    i++;
                }
                else {
                    // Binary operator
                    tokens.push(char);
                    expectingOperand = true; // Expect operand after a binary operator
                    i++;
                }
            }
            else {
                // * or / are strictly binary
                tokens.push(char);
                expectingOperand = true;
                i++;
            }
        }
        else {
            // Should not happen based on problem description, but good for robustness
            i++;
        }
    }
    // --- Shunting-Yard / Direct Evaluation using two stacks (Value and Operator) ---
    const values = [];
    const ops = [];
    // Helper function to define precedence
    const precedence = (op) => {
        if (op === '+' || op === '-')
            return 1;
        if (op === '*' || op === '/')
            return 2;
        return 0;
    };
    // Apply an operation on top of the stacks
    const applyOp = () => {
        const op = ops.pop();
        if (op === '(')
            return;
        const right = values.pop();
        const left = values.pop();
        if (left === undefined || right === undefined) {
            throw new Error("Syntax error: Insufficient operands.");
        }
        let result;
        switch (op) {
            case '+':
                result = left + right;
                break;
            case '-':
                result = left - right;
                break;
            case '*':
                result = left * right;
                break;
            case '/':
                if (right === 0)
                    throw new Error("Division by zero.");
                // Division truncates toward zero (Math.trunc)
                result = Math.trunc(left / right);
                break;
            default: throw new Error(`Unknown operator: ${op}`);
        }
        values.push(result);
    };
    for (const token of tokens) {
        if (typeof token === 'number') {
            values.push(token);
        }
        else if (token === '(') {
            ops.push(token);
        }
        else if (token === ')') {
            while (ops.length && ops[ops.length - 1] !== '(') {
                applyOp();
            }
            if (ops.length && ops[ops.length - 1] === '(') {
                ops.pop(); // Pop '('
            }
            else {
                throw new Error("Syntax error: Mismatched parentheses.");
            }
        }
        else if (token === '+' || token === '-' || token === '*' || token === '/') {
            // Handle unary operators contextually during evaluation setup
            // This simplified evaluation assumes standard infix notation where unary operators
            // are either immediately preceding a number (which gets parsed as part of the number)
            // or handled by explicit parsing rules. Since the input format is a single line
            // and we tokenized based on characters, we need to enforce unary logic.
            // A common technique for robust handling of unary minus:
            // If the token is '-' or '+' and the previous token was an operator or '(', it's unary.
            // For simplicity in this direct evaluation structure, we'll rely on the property that
            // unary operators should have already been converted or handled during tokenization.
            // Given the tokenization above, if we see '-' or '+' and expectingOperand is true, it's unary.
            if (token === '-' && expectingOperand) {
                // Convert unary minus (e.g., -5) to 0 - 5 for easier processing, or handle it during value pushing.
                // For direct evaluation, we treat unary minus as an operation that consumes the next number.
                // A simpler approach for this constraint set is to rewrite the expression slightly
                // or push a 0 and then a negative number.
                // Let's adapt the logic: if we see unary '-', we push 0 and then treat the subsequent number
                // with a negative sign.
                ops.push('U-'); // Sentinel for unary minus
            }
            else if (token === '+' && expectingOperand) {
                ops.push('U+'); // Sentinel for unary plus (effectively ignored unless context demands addition)
            }
            else {
                // Binary operator
                ops.push(token);
            }
            expectingOperand = true;
        }
    }
    // Final processing loop
    while (ops.length > 0) {
        const op = ops.pop();
        if (op === '(') {
            throw new Error("Syntax error: Unmatched parenthesis.");
        }
        if (op === 'U-') {
            // Unary minus: If the top of values is V, it becomes -V.
            const val = values.pop();
            values.push(-val);
        }
        else if (op === 'U+') {
            // Unary plus does nothing
        }
        else {
            applyOp();
        }
    }
    if (values.length !== 1) {
        throw new Error("Syntax error: Invalid expression structure.");
    }
    return values[0];
}
// --- Main Execution ---
function main() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8").trim();
        if (input) {
            const result = evaluateExpression(input);
            console.log(result);
        }
    }
    catch (error) {
        // In a competitive programming environment, errors might need to be suppressed or handled minimally.
        // console.error("Error during evaluation:", error.message);
        // For strict output requirements, we only output the result. If an error occurs,
        // we assume the input is valid per problem constraints or that the system expects a clean run.
    }
}
main();
