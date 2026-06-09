const fs = require('fs');

/**
 * Defines the precedence of operators. Higher number means higher precedence.
 * Unary operators are handled implicitly during tokenization/evaluation.
 */
const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
};

/**
 * Checks if a token is an operator.
 * @param {string} token
 * @returns {boolean}
 */
function isOperator(token) {
    return token === '+' || token === '-' || token === '*' || token === '/';
}

/**
 * Applies the operation to two operands.
 * Handles division truncating toward zero (like C/Java integer division).
 * @param {number} op1
 * @param {number} op2
 * @param {string} operator
 * @returns {number}
 */
function applyOp(op1, op2, operator) {
    switch (operator) {
        case '+': return op1 + op2;
        case '-': return op1 - op2;
        case '*': return op1 * op2;
        case '/':
            // Division truncates toward zero.
            // Math.trunc handles both positive and negative results correctly for truncation.
            return Math.trunc(op1 / op2);
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}

/**
 * Processes the input string to tokenize it, handling multi-digit numbers
 * and correctly identifying unary vs. binary operators.
 * @param {string} expression
 * @returns {string[]} Array of tokens
 */
function tokenize(expression) {
    // Remove all whitespace for easier processing, but preserve structure for parsing context
    let cleanExpression = expression.replace(/\s+/g, '');
    const tokens = [];
    let i = 0;

    while (i < cleanExpression.length) {
        let char = cleanExpression[i];

        if (/[0-9]/.test(char)) {
            // Parse number
            let numStr = '';
            while (i < cleanExpression.length && /[0-9]/.test(cleanExpression[i])) {
                numStr += cleanExpression[i];
                i++;
            }
            tokens.push(parseFloat(numStr));
            continue;
        }

        // Handle operators and parentheses
        if (isOperator(char) || char === '(' || char === ')') {
            // Check for unary operators (+ or -)
            let isUnary = false;

            if (char === '-' || char === '+') {
                // Unary check:
                // 1. Start of expression
                // 2. Immediately follows an opening parenthesis
                // 3. Immediately follows another operator
                if (i === 0 || cleanExpression[i - 1] === '(' || isOperator(cleanExpression[i - 1])) {
                    isUnary = true;
                }
            }

            if (isUnary) {
                // Treat unary sign as part of the next number or a special token
                // We handle unary negation by transforming it into a (0 - X) structure or just treating it as a prefix operator.
                
                // For simplicity in the stack evaluation, we handle unary signs by pushing a special marker
                // or by ensuring the next number is processed with the correct sign.
                
                // If it's a unary minus/plus, we push it as a special operator token
                tokens.push(char);
            } else {
                // Binary operator
                tokens.push(char);
            }
            i++;
            continue;
        }

        // If we reach here, it's an invalid character
        throw new Error(`Invalid character in expression: ${char}`);
    }

    return tokens;
}

/**
 * Main function to evaluate the expression using the two-stack approach.
 * @param {string} expression
 * @returns {number} The evaluated integer result.
 */
function evaluate(expression) {
    const tokens = tokenize(expression);
    const values = []; // Stack for numerical values
    const ops = [];    // Stack for operators

    for (const token of tokens) {
        if (typeof token === 'number') {
            values.push(token);
        } else if (token === '(') {
            ops.push(token);
        } else if (token === ')') {
            while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                const op = ops.pop();
                const val2 = values.pop();
                const val1 = values.pop();
                values.push(applyOp(val1, val2, op));
            }
            if (ops.length === 0 || ops.pop() !== '(') {
                throw new Error("Mismatched parentheses.");
            }
        } else if (isOperator(token)) {
            // Handle Unary operators (+/-)
            if (token === '+' || token === '-') {
                if (values.length === 0) {
                    // This case should ideally be handled during tokenization, but serves as a safeguard.
                    throw new Error("Syntax error: Unary operator at start or after opening parenthesis without an operand.");
                }
                const op1 = values.pop();
                
                // Apply unary operation
                let result;
                if (token === '+') {
                    result = op1;
                } else { // '-'
                    result = -op1;
                }
                values.push(result);
            } else {
                // Handle Binary operators (*, /, +, -)
                while (ops.length > 0 && precedence[ops[ops.length - 1]] >= precedence[token]) {
                    const op = ops.pop();
                    const val2 = values.pop();
                    const val1 = values.pop();
                    values.push(applyOp(val1, val2, op));
                }
                ops.push(token);
            }
        }
    }

    // Process remaining operators
    while (ops.length > 0) {
        const op = ops.pop();
        if (op === '(' || op === ')') {
            throw new Error("Mismatched parentheses remaining.");
        }
        if (values.length < 2) {
             throw new Error("Syntax error: Insufficient operands for operator.");
        }
        const val2 = values.pop();
        const val1 = values.pop();
        values.push(applyOp(val1, val2, op));
    }

    if (values.length !== 1) {
        throw new Error("Evaluation failed: Result stack size incorrect.");
    }

    // The final result must be an integer
    const result = values[0];
    if (!Number.isInteger(result)) {
        // Although intermediate results fit safe integers, the final output must be an integer.
        // This handles cases where the final operation might result in a float (e.g., 5 / 2 = 2.5)
        // which must be truncated if the requirement implies integer output.
        return Math.trunc(result);
    }

    return result;
}

// --- Main Execution ---

try {
    // Read all input from stdin
    const input = fs.readFileSync(0, "utf8").trim();

    if (input.length === 0) {
        // Handle empty input case gracefully
        console.log(0);
        process.exit(0);
    }

    const result = evaluate(input);
    console.log(result);

} catch (e) {
    // Handle potential errors (parsing, syntax, etc.)
    // In a strict environment, this might just crash, but for robustness:
    // console.error("Error:", e.message);
    // console.log("Error: Invalid expression.");
    process.exit(1);
}
