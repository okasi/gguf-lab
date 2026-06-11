import * as fs from "fs";

/**
 * Evaluates an arithmetic expression.
 * Supports +, -, *, /, and unary +/-, with parentheses.
 * Division truncates toward zero.
 * @param expression The arithmetic expression string.
 * @returns The integer result of the expression.
 */
function evaluate(expression: string): number {
    // Tokenization and Preprocessing
    let tokens: string[] = [];
    let i = 0;
    const len = expression.length;

    // Insert spaces around operators and parentheses to simplify splitting,
    // but handle existing spaces correctly.
    let processedExpression = expression
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .replace(/\*/g, " * ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " - ");

    // Clean up multiple spaces
    while (processedExpression.includes("  ")) {
        processedExpression = processedExpression.replace("  ", " ");
    }

    tokens = processedExpression.trim().split(" ").filter(token => token.length > 0);

    // Shunting-Yard implementation to convert infix to postfix (RPN)
    const precedence: Record<string, number> = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };

    const outputQueue: string[] = [];
    const operatorStack: string[] = [];

    for (let token of tokens) {
        if (!isNaN(parseInt(token))) {
            // Token is a number
            outputQueue.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop()!);
            }
            operatorStack.pop(); // Remove '('
        } else if (precedence[token]) {
            // Token is an operator (+, -, *, /)
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1] !== '(' &&
                precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
            ) {
                outputQueue.push(operatorStack.pop()!);
            }
            operatorStack.push(token);
        } else {
            // Handle Unary operators (+/-)
            // If the token is + or -, and it's the first token, or preceded by '(', or preceded by another operator, it's unary.
            const isUnary = token === '+' || token === '-';
            let isUnaryContext = false;
            if (tokens.indexOf(token) === 0) {
                isUnaryContext = true;
            } else {
                const prevIndex = tokens.indexOf(token) - 1;
                if (prevIndex >= 0) {
                    const prevToken = tokens[prevIndex];
                    if (prevToken === '(' || precedence[prevToken]) {
                        isUnaryContext = true;
                    }
                }
            }

            if (isUnary && isUnaryContext) {
                // Represent unary plus as the number itself, and unary minus as a negation operation (0 - X)
                if (token === '+') {
                    outputQueue.push("0");
                    outputQueue.push("+");
                } else { // token === '-'
                    outputQueue.push("0");
                    outputQueue.push("-");
                }
            } else {
                // Standard binary operator handling (should already be handled above, but this catches any edge cases in tokenization)
                // If it reached here and is + or -, it must be binary based on how the logic above was structured.
                while (
                    operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1] !== '(' &&
                    precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
                ) {
                    outputQueue.push(operatorStack.pop()!);
                }
                operatorStack.push(token);
            }
        }
    }

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop()!);
    }

    // RPN Evaluation
    const evaluationStack: number[] = [];

    for (let token of outputQueue) {
        if (!isNaN(parseInt(token))) {
            evaluationStack.push(parseInt(token));
        } else {
            const b = evaluationStack.pop()!;
            const a = evaluationStack.pop()!;
            let result: number;

            switch (token) {
                case '+':
                    result = a + b;
                    break;
                case '-':
                    result = a - b;
                    break;
                case '*':
                    result = a * b;
                    break;
                case '/':
                    // Division truncates toward zero (Math.trunc is equivalent for integer division here)
                    result = Math.trunc(a / b);
                    break;
                default:
                    // Should not happen if tokenization and shunting-yard are correct
                    throw new Error(`Unknown token: ${token}`);
            }
            evaluationStack.push(result);
        }
    }

    return evaluationStack[0];
}

// Main execution block
try {
    // Read all input from standard in (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();

    if (input.length > 0) {
        const result = evaluate(input);
        console.log(result);
    }
} catch (e) {
    // Handle potential errors during file read or evaluation, though the prompt implies valid input.
    // In a contest setting, this block might just be empty or handle specific error codes.
}
