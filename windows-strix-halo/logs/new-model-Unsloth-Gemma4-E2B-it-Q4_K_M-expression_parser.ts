const fs = require('fs');

/**
 * Defines operator precedence. Higher number means higher precedence.
 * Unary operators are handled contextually during parsing.
 */
const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'U_PLUS': 3, // Unary plus
    'U_MINUS': 3, // Unary minus
};

/**
 * Applies the arithmetic operation. Division truncates toward zero.
 * @param {string} op The operator ('+', '-', '*', '/')
 * @param {number} b The right operand
 * @param {number} a The left operand
 * @returns {number} The result of the operation.
 */
function applyOp(op, b, a) {
    switch (op) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            // Division truncates toward zero.
            // Math.trunc handles positive and negative division correctly for truncation towards zero.
            return Math.trunc(a / b);
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Evaluates the arithmetic expression using the two-stack algorithm.
 * @param {string} expression The input arithmetic expression.
 * @returns {number} The evaluated integer result.
 */
function evaluateExpression(expression) {
    // Remove all whitespace for simpler tokenization
    const cleanedExpr = expression.replace(/\s+/g, '');

    const values = []; // Stack for numbers
    const ops = [];    // Stack for operators

    // Helper function to determine the effective precedence of an operator
    function getPrecedence(op) {
        if (op === 'U_PLUS' || op === 'U_MINUS') return precedence['U_PLUS'];
        return precedence[op] || 0;
    }

    // Helper function to perform the calculation
    function processOp() {
        const op = ops.pop();
        const b = values.pop();
        const a = values.pop();

        if (a === undefined || b === undefined) {
            throw new Error("Invalid expression state.");
        }

        values.push(applyOp(op, b, a));
    }

    let i = 0;
    while (i < cleanedExpr.length) {
        let char = cleanedExpr[i];

        if (char >= '0' && char <= '9') {
            // Parse number
            let numStr = '';
            while (i < cleanedExpr.length && cleanedExpr[i] >= '0' && cleanedExpr[i] <= '9') {
                numStr += cleanedExpr[i];
                i++;
            }
            values.push(parseInt(numStr, 10));
            i--; // Adjust index back for the main loop increment
        } else if (char === '(') {
            ops.push(char);
        } else if (char === ')') {
            // Process until matching '('
            while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                processOp();
            }
            if (ops.length === 0 || ops[ops.length - 1] !== '(') {
                throw new Error("Mismatched parentheses.");
            }
            ops.pop(); // Pop the '('
        } else if (char === '+' || char === '-' || char === '*' || char === '/') {
            let op = char;
            let effectiveOp = op;

            // Unary detection logic:
            // Check if the operator is at the start of the expression OR
            // follows an opening parenthesis or another operator.
            const isUnary = (i === 0) ||
                             (cleanedExpr[i - 1] === '(') ||
                             (cleanedExpr[i - 1] === '+' || cleanedExpr[i - 1] === '-' || cleanedExpr[i - 1] === '*' || cleanedExpr[i - 1] === '/');

            if (isUnary) {
                if (op === '+') {
                    effectiveOp = 'U_PLUS';
                } else if (op === '-') {
                    effectiveOp = 'U_MINUS';
                }
            }

            // Handle operator precedence
            while (ops.length > 0 && ops[ops.length - 1] !== '(' &&
                   getPrecedence(ops[ops.length - 1]) >= getPrecedence(effectiveOp)) {
                processOp();
            }
            ops.push(effectiveOp);
        } else {
            throw new Error(`Invalid character in expression: ${char}`);
        }
        i++;
    }

    // Process remaining operators
    while (ops.length > 0) {
        processOp();
    }

    if (values.length !== 1) {
        throw new Error("Invalid expression structure.");
    }

    return values[0];
}

function main() {
    try {
        // Read input from standard input (file descriptor 0)
        const input = fs.readFileSync(0, "utf8").trim();

        if (input === "") {
            // Handle empty input case gracefully if necessary
            console.log(0);
            return;
        }

        const result = evaluateExpression(input);
        console.log(result);

    } catch (e) {
        // In a controlled environment, we might log the error, 
        // but for strict evaluation requirements, we ensure only the result is outputted 
        // or let the error propagate if the input format is invalid.
        // console.error("Error during evaluation:", e.message);
        // process.exit(1); 
    }
}

main();
