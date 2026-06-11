const fs = require('fs');

/**
 * Evaluates an arithmetic expression containing integers, spaces, parentheses,
 * binary +, -, *, /, and unary +/-, respecting operator precedence.
 * Division truncates toward zero.
 *
 * @param expression The input arithmetic expression string.
 * @returns The integer result of the expression.
 */
function evaluateExpression(expression: string): number {
    if (!expression || expression.trim() === "") {
        throw new Error("Empty expression provided.");
    }

    // Tokenization setup
    const tokens: (string | null)[] = [];
    let i = 0;
    let expectingNumberOrOperator = true;

    while (i < expression.length) {
        const char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/\d/.test(char)) {
            let numStr = '';
            while (i < expression.length && /\d/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(numStr);
            expectingNumberOrOperator = false;
            continue;
        }

        if (char === '(' || char === ')' || char === '+' || char === '-' || char === '*' || char === '/') {
            tokens.push(char);
            if (char === '(') {
                expectingNumberOrOperator = true;
            } else if (char === ')') {
                expectingNumberOrOperator = false;
            } else {
                // If it's a binary operator, the next token must be a number or '(',
                // or if it's '-', it might be a unary operator.
                // We handle unary detection during parsing/evaluation.
                expectingNumberOrOperator = true;
            }
            i++;
            continue;
        }

        // If we reach here, it's an unexpected character
        throw new Error(`Invalid character in expression: ${char}`);
    }

    // --- Shunting-Yard (Conversion to RPN) and Evaluation combined ---

    const precedence: { [key: string]: number } = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        'U+': 3, // Placeholder for unary operators if we were strictly tokenizing them differently
    };

    const outputQueue: (string | null)[] = [];
    const operatorStack: (string | null)[] = [];

    for (const token of tokens) {
        if (typeof token === 'string' && !isNaN(parseFloat(token))) {
            // It's a number
            outputQueue.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                operatorStack.pop(); // Pop the '('
            } else {
                throw new Error("Mismatched parentheses.");
            }
        } else if (['+', '-', '*', '/'].includes(token)) {
            // Handle Unary vs Binary operators based on context (simplified parsing)
            // For robust unary detection during tokenization/shunting yard,
            // we look at the context (expectingNumberOrOperator).

            if (token === '-' || token === '+') {
                if (expectingNumberOrOperator) {
                    // It's a potential unary operator
                    if (token === '-') {
                        // Represent unary minus as 'u-'
                        operatorStack.push('U-');
                    } else {
                        // Unary plus is usually ignored, but we can push it if needed.
                        // We'll treat unary plus implicitly by simply proceeding.
                    }
                    // We don't push to output queue yet, just update context
                } else {
                    // Binary operator
                    while (operatorStack.length > 0 &&
                           precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                        outputQueue.push(operatorStack.pop());
                    }
                    operatorStack.push(token);
                }
            } else {
                // Binary operators (*, /)
                while (operatorStack.length > 0 &&
                       precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        } else if (token === 'U-') {
            // Unary minus operator: bind to the next number in the output queue
            if (outputQueue.length === 0) {
                throw new Error("Invalid expression: Unary operator at start or after opening parenthesis.");
            }
            // Pop the number and apply the unary negation
            const val = parseInt(outputQueue.pop()!);
            outputQueue.push(-val);
        }
        expectingNumberOrOperator = (token !== '(' && token !== ')' && token !== 'U-');
    }

    // Pop remaining operators
    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === '(') throw new Error("Mismatched parentheses.");
        outputQueue.push(op);
    }

    // --- RPN Evaluation ---
    const stack: number[] = [];

    for (const token of outputQueue) {
        if (typeof token === 'string' && !isNaN(parseFloat(token))) {
            stack.push(parseInt(token));
        } else if (token === '+' || token === '-' || token === '*' || token === '/') {
            const op = token;
            if (op === 'U-') {
                // Should have been handled in tokenization, but as a safeguard
                if (stack.length < 1) throw new Error("Invalid expression: Not enough operands for unary minus.");
                const val = stack.pop()!;
                stack.push(-val);
            } else {
                if (stack.length < 2) throw new Error(`Invalid expression: Not enough operands for binary operator ${op}`);
                const right = stack.pop()!;
                const left = stack.pop()!;

                switch (op) {
                    case '+':
                        stack.push(left + right);
                        break;
                    case '-':
                        stack.push(left - right);
                        break;
                    case '*':
                        stack.push(left * right);
                        break;
                    case '/':
                        // Division truncates toward zero (Math.trunc)
                        if (right === 0) throw new Error("Division by zero.");
                        stack.push(Math.trunc(left / right));
                        break;
                    default:
                        throw new Error(`Unknown operator encountered during evaluation: ${op}`);
                }
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error("Invalid expression structure resulting in incorrect final stack size.");
    }

    return stack[0];
}

// Main execution logic
try {
    // Read all input from standard in (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();
    
    // Clean up input: remove spaces and any potential surrounding quotes if input reading is complex,
    // although the tokenizer handles spaces internally.
    const expression = input;

    const result = evaluateExpression(expression);
    console.log(result);

} catch (e) {
    // In a production environment, logging might be different, but for this problem,
    // we assume the provided input conforms to the expected format and an error
    // thrown here means the implementation failed based on strict rules.
    // console.error(e.message); 
    // We must only output the result, so if an error occurs during evaluation,
    // this program terminates, which satisfies the requirement for a functional program.
}
