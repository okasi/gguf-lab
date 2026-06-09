const fs = require('fs');

/**
 * Custom function to perform arithmetic operations.
 * Handles division truncation toward zero.
 * @param {number} op - The operator (+, -, *, /).
 * @param {number} a - The left operand.
 * @param {number} b - The right operand.
 * @returns {number} The result of the operation.
 */
function operate(op, a, b) {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            // Division truncates toward zero.
            // Math.trunc handles both positive and negative results correctly for truncation.
            return Math.trunc(a / b);
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Determines the precedence level of an operator.
 * Higher number means higher precedence.
 * @param {string} op
 * @returns {number}
 */
function precedence(op) {
    switch (op) {
        case '+':
        case '-':
            return 1;
        case '*':
        case '/':
            return 2;
        default:
            return 0;
    }
}

/**
 * Checks if a token is an operator.
 * @param {string} token
 * @returns {boolean}
 */
function isOperator(token) {
    return ['+', '-', '*', '/'].includes(token);
}

/**
 * Tokenizes the input expression, specifically handling unary signs.
 * @param {string} expression
 * @returns {string[]} Array of tokens.
 */
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    let expectingOperand = true; // True if we expect a number or unary operator

    while (i < expression.length) {
        let char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/\d/.test(char)) {
            // Handle numbers
            let numStr = '';
            while (i < expression.length && /\d/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(numStr);
            expectingOperand = false;
            continue;
        }

        if (char === '(') {
            tokens.push(char);
            i++;
            expectingOperand = true;
            continue;
        }

        if (char === ')') {
            tokens.push(char);
            i++;
            expectingOperand = false;
            continue;
        }

        if (char === '+' || char === '-') {
            if (expectingOperand) {
                // Unary operator case: If we expect an operand (start of expression, after '(', or after another operator)
                tokens.push(char); // Treat the sign as a unary operator token
                i++;
                // Still expecting an operand after a unary operator
                expectingOperand = true;
            } else {
                // Binary operator case
                tokens.push(char);
                i++;
                // Next token must be an operand
                expectingOperand = true;
            }
            continue;
        }

        // Handle unexpected characters (or error)
        throw new Error(`Invalid character in expression: ${char}`);
    }

    return tokens;
}

/**
 * Evaluates the expression using the Shunting-Yard principle (Two Stacks).
 * @param {string} expression
 * @returns {number} The evaluated integer result.
 */
function evaluateExpression(expression) {
    if (!expression || expression.trim() === '') {
        return 0;
    }

    const tokens = tokenize(expression.replace(/\s+/g, '')); // Remove all whitespace
    const values = []; // Stack for numbers
    const ops = [];    // Stack for operators

    for (const token of tokens) {
        if (!isNaN(Number(token))) {
            // Token is a number
            values.push(Number(token));
        } else if (token === '(') {
            ops.push(token);
        } else if (token === ')') {
            // Pop operators until '(' is found
            while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                const op = ops.pop();
                const val2 = values.pop();
                const val1 = values.pop();
                values.push(operate(op, val1, val2));
            }
            if (ops.length === 0 || ops[ops.length - 1] !== '(') {
                throw new Error("Mismatched parentheses.");
            }
            ops.pop(); // Pop the '('
        } else if (isOperator(token)) {
            // Token is an operator
            while (
                ops.length > 0 &&
                precedence(ops[ops.length - 1]) >= precedence(token) &&
                ops[ops.length - 1] !== '('
            ) {
                const op = ops.pop();
                const val2 = values.pop();
                const val1 = values.pop();
                values.push(operate(op, val1, val2));
            }
            ops.push(token);
        } else {
            throw new Error(`Syntax error: Unexpected token ${token}`);
        }
    }

    // Process remaining operators
    while (ops.length > 0) {
        const op = ops.pop();
        if (op === '(' || op === ')') {
            throw new Error("Mismatched parentheses remaining.");
        }
        const val2 = values.pop();
        const val1 = values.pop();
        values.push(operate(op, val1, val2));
    }

    if (values.length !== 1) {
        throw new Error("Invalid expression format resulting in multiple values.");
    }

    return values[0];
}

function main() {
    try {
        // Read input from standard input (file descriptor 0)
        const input = fs.readFileSync(0, "utf8").trim();
        if (input === '') {
            console.log(0);
            return;
        }
        const result = evaluateExpression(input);
        console.log(result);
    } catch (error) {
        // In a strict competitive programming environment, error handling might be minimal,
        // but for robustness, we catch errors.
        // console.error("Error during evaluation:", error.message);
        // Depending on requirements, we might exit or output an error code.
    }
}

main();
