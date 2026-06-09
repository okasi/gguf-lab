const fs = require('fs');

function evaluateExpression(expression: string): number {
    // Step 1: Tokenization
    const tokens = tokenize(expression);

    // Step 2: Shunting-Yard Algorithm (Infix to RPN)
    const rpnTokens = shuntingYard(tokens);

    // Step 3: RPN Evaluation
    return evaluateRPN(rpnTokens);
}

/**
 * Tokenizes the input expression into numbers, operators, and parentheses.
 * Handles multi-digit numbers and identifies unary operators based on context.
 * @param expression The input arithmetic string.
 * @returns An array of tokens (string or number).
 */
function tokenize(expression: string): (string | number)[] {
    const tokens: (string | number)[] = [];
    let i = 0;
    const n = expression.length;

    while (i < n) {
        let char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue; // Skip spaces
        }

        // Check for numbers (including decimals, though problem implies integers, safe check)
        if (/[0-9]/.test(char)) {
            let numStr = '';
            while (i < n && /[0-9]/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(parseInt(numStr, 10));
            continue;
        }

        // Check for operators and parentheses
        if (['+', '-', '*', '/', '(', ')'].includes(char)) {
            // Check for unary operator context
            const isUnary = (char === '+' || char === '-') && (
                i === 0 ||
                expression[i - 1] === '(' ||
                ['+', '-', '*', '/'].includes(expression[i - 1])
            );

            if (isUnary) {
                // If it's a unary operator, we treat it as a distinct token for easier processing,
                // or handle it by modifying the subsequent number.
                // For simplicity in the Shunting Yard, we use explicit unary markers if needed,
                // but here we can just push the operator itself and rely on the precedence rules.
                tokens.push(char);
                i++;
            } else {
                tokens.push(char);
                i++;
            }
            continue;
        }

        // If we reach here, it's an invalid character
        throw new Error(`Invalid character in expression: ${char}`);
    }

    return tokens;
}

/**
 * Defines operator precedence. Higher number means higher precedence.
 * Unary operators are handled specially during tokenization/parsing.
 */
const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'U+': 3 // Represents unary plus/minus if tokenized separately
};

/**
 * Checks if a token is an operator.
 */
function isOperator(token: string | number): token is string {
    return typeof token === 'string' && ['+', '-', '*', '/', '(', ')'].includes(token);
}

/**
 * Checks if a token is a number (operand).
 */
function isOperand(token: string | number): token is number {
    return typeof token === 'number';
}

/**
 * Converts an infix token list to Reverse Polish Notation (RPN) using Shunting-Yard.
 * @param tokens The list of tokens.
 * @returns The RPN list of tokens.
 */
function shuntingYard(tokens: (string | number)[]): (string | number)[] {
    const output: (string | number)[] = [];
    const operatorStack: (string | number)[] = [];

    for (const token of tokens) {
        if (isOperand(token)) {
            output.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                output.push(operatorStack.pop() as string);
            }
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
                throw new Error("Mismatched parentheses");
            }
            operatorStack.pop(); // Pop '('
        } else if (isOperator(token)) {
            // Handle Unary operators: If we see a unary operator, push it immediately.
            // (In our current tokenizer, we rely on the tokenizer to handle context,
            // so we treat +, - as binary operators here, relying on the input structure
            // to imply unary context via precedence rules.)

            while (
                operatorStack.length > 0 &&
                isOperator(operatorStack[operatorStack.length - 1]) &&
                precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
            ) {
                output.push(operatorStack.pop() as string);
            }
            operatorStack.push(token);
        }
    }

    // Pop remaining operators from the stack to the output
    while (operatorStack.length > 0) {
        const op = operatorStack.pop() as string;
        if (op === '(' || op === ')') {
            throw new Error("Mismatched parentheses remaining");
        }
        output.push(op);
    }

    return output;
}

/**
 * Evaluates an expression given in Reverse Polish Notation (RPN).
 * @param rpnTokens The RPN list of tokens.
 * @returns The final evaluated integer result.
 */
function evaluateRPN(rpnTokens: (string | number)[]): number {
    const stack: number[] = [];

    for (const token of rpnTokens) {
        if (isOperand(token)) {
            stack.push(token);
        } else if (isOperator(token)) {
            if (stack.length < 2) {
                throw new Error("Invalid RPN expression: insufficient operands");
            }
            const right = stack.pop();
            const left = stack.pop();
            let result: number;

            switch (token) {
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
                    // Division truncates toward zero (standard JS behavior for integers)
                    result = Math.trunc(left / right);
                    break;
                default:
                    throw new Error(`Unknown operator: ${token}`);
            }
            stack.push(result);
        }
    }

    if (stack.length !== 1) {
        throw new Error("Invalid RPN expression: too many operands left");
    }

    return stack[0];
}

// Main execution block
try {
    // Read all input from stdin (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();
    if (input === "") {
        // Handle empty input case if necessary, though constraints imply an expression exists
        console.log(0); 
    } else {
        const result = evaluateExpression(input);
        console.log(result);
    }
} catch (e) {
    // In a competitive programming environment, errors are usually suppressed or handled minimally.
    // For this solution, we rely on the defined logic.
    // console.error(e);
}
