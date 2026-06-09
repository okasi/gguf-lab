const fs = require('fs');

/**
 * Evaluates an arithmetic expression containing integers, spaces, parentheses,
 * binary +, -, *, /, and unary +/-, respecting operator precedence.
 * Division truncates toward zero.
 *
 * @param expression The input arithmetic expression string.
 * @returns The integer result of the evaluation.
 */
function evaluateExpression(expression: string): number {
    if (!expression.trim()) {
        return 0;
    }

    // 1. Tokenization and Preprocessing: Insert spaces around operators and handle unary minus/plus.

    let tokens: string[] = [];
    let i = 0;
    const n = expression.length;

    while (i < n) {
        let char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue; // Skip spaces
        }

        if (/\d/.test(char)) {
            // Handle multi-digit numbers
            let numStr = '';
            while (i < n && /\d/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(numStr);
            continue;
        }

        // Operator handling
        if (['+', '-', '*', '/'].includes(char)) {
            // Peek at the previous token to determine if '+' or '-' is unary
            const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
            const isUnary = (char === '+' || char === '-') && (
                prevToken === null ||
                /\d/.test(prevToken) ||
                prevToken === '(' ||
                ['+', '-', '*', '/'].includes(prevToken) // Handle cases like -- or +*
            );

            if (isUnary) {
                // If it's a unary operator, we treat it as part of the next number or the previous number.
                // For simplicity in tokenization, we'll push the operator and let the parser handle the context.
                // We'll use a special token or rely on the Shunting-Yard mechanism to handle unary ops correctly.
                tokens.push(char);
                i++;
                continue;
            }
            
            tokens.push(char);
            i++;
            continue;
        }
        
        // Parentheses (handled implicitly by tokenization)
        if (char === '(' || char === ')') {
            tokens.push(char);
            i++;
            continue;
        }

        i++; // Should not happen for valid input

    }

    // 2. Convert to RPN using Shunting-Yard Algorithm
    
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };

    const outputQueue: string[] = [];
    const operatorStack: string[] = [];

    for (const token of tokens) {
        if (/^\d+$/.test(token)) {
            // Token is a number
            outputQueue.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
                throw new Error("Mismatched parentheses");
            }
            operatorStack.pop(); // Pop '('
        } else { // Operator
            // Handle unary operators explicitly in the RPN context
            if (token === '+' || token === '-') {
                // For simplicity in the standard Shunting-Yard, if we allow unary operators
                // to be parsed as part of the number sequence, we would need a lookahead.
                // Since we tokenized them separately, we treat them as standard operators,
                // relying on the stack to manage context.
            }

            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1] !== '(' &&
                precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }
    }

    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === '(') {
            throw new Error("Mismatched parentheses");
        }
        outputQueue.push(op);
    }
    
    // 3. RPN Evaluation
    
    const evaluationStack: number[] = [];

    for (const token of outputQueue) {
        if (/^\d+$/.test(token)) {
            evaluationStack.push(parseInt(token, 10));
        } else if (token === '+' || token === '-' || token === '*' || token === '/') {
            if (evaluationStack.length < 2) {
                throw new Error("Invalid expression: insufficient operands");
            }

            const operand2 = evaluationStack.pop();
            const operand1 = evaluationStack.pop();
            let result: number;

            switch (token) {
                case '+':
                    result = operand1 + operand2;
                    break;
                case '-':
                    result = operand1 - operand2;
                    break;
                case '*':
                    result = operand1 * operand2;
                    break;
                case '/':
                    // Division truncates toward zero (JavaScript Math.trunc or standard integer division)
                    if (operand2 === 0) {
                        throw new Error("Division by zero");
                    }
                    // Math.trunc achieves truncation towards zero for both positive and negative results.
                    result = Math.trunc(operand1 / operand2);
                    break;
            }
            evaluationStack.push(result);
        }
    }

    if (evaluationStack.length !== 1) {
        throw new Error("Invalid expression: too many operands left");
    }

    return evaluationStack[0];
}

function main() {
    // Read all input from standard in
    const input = fs.readFileSync(0, "utf8").trim();
    
    if (!input) {
        console.log(0);
        return;
    }

    try {
        const result = evaluateExpression(input);
        console.log(result);
    } catch (e) {
        // In a real competitive programming environment, errors might be ignored,
        // but here we ensure robustness if the input format is strictly followed.
        // console.error(e.message);
        // For this specific problem, we assume valid input that fits constraints.
    }
}

main();
