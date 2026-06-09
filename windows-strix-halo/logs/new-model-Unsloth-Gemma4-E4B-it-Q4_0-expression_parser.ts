import * as fs from 'fs';

/**
 * Defines the structure of a token.
 */
type Token = {
    type: 'NUMBER' | 'OPERATOR' | 'PAREN';
    value: string | number;
};

/**
 * Tokenizes the input arithmetic expression string.
 * Handles multi-digit numbers and distinguishes between unary and binary operators.
 * @param expression The raw input string.
 * @returns An array of Tokens.
 */
function lexer(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    
    // Clean up input: remove whitespace
    const cleanedExpression = expression.replace(/\s/g, '');
    
    // Tracks the type of the last token to determine if the current sign is unary.
    // Starts as 'START' (meaning the first token must be a number or unary op).
    let lastTokenType: 'START' | 'OPERATOR' | 'PAREN' = 'START';

    while (i < cleanedExpression.length) {
        const char = cleanedExpression[i];

        if (char >= '0' && char <= '9') {
            let numStr = '';
            while (i < cleanedExpression.length && cleanedExpression[i] >= '0' && cleanedExpression[i] <= '9') {
                numStr += cleanedExpression[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseInt(numStr) });
            lastTokenType = 'NUMBER';
            continue;
        } 
        
        if (char === '(') {
            tokens.push({ type: 'PAREN', value: char });
            lastTokenType = 'PAREN';
            i++;
            continue;
        }

        if (char === ')') {
            tokens.push({ type: 'PAREN', value: char });
            lastTokenType = 'PAREN';
            i++;
            continue;
        }

        if (char === '+' || char === '-') {
            let isUnary = false;

            // A sign is unary if it is at the start, or immediately follows another operator or an opening parenthesis.
            if (lastTokenType === 'START' || lastTokenType === 'OPERATOR' || lastTokenType === 'PAREN') {
                isUnary = true;
            }
            
            // Treat unary operations by replacing them with a 0 operand implicitly.
            // e.g., -5 becomes 0 - 5.
            if (isUnary) {
                // If it's unary, insert a '0' token first.
                tokens.push({ type: 'NUMBER', value: 0 });
                
                // The sign itself now acts as a binary operator (e.g., 0 - X).
                tokens.push({ type: 'OPERATOR', value: char });
                lastTokenType = 'OPERATOR';
            } else {
                // Binary operator
                tokens.push({ type: 'OPERATOR', value: char });
                lastTokenType = 'OPERATOR';
            }
            i++;
            continue;
        }

        throw new Error(`Lexer Error: Unknown character '${char}' at position ${i}.`);
    }

    return tokens;
}

/**
 * Converts the infix tokens to Reverse Polish Notation (RPN) using the Shunting-Yard algorithm.
 * @param tokens The array of infix tokens.
 * @returns An array of RPN tokens.
 */
function shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    // Operator precedence: Unary (Implicit 0 OP X) < * / < + -
    const precedence: Record<string, number> = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };

    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            outputQueue.push(token);
        } else if (token.type === 'OPERATOR') {
            const op1 = token.value;

            while (operatorStack.length > 0) {
                const topToken = operatorStack[operatorStack.length - 1];
                if (topToken.type === 'PAREN') {
                    break;
                }
                const op2 = topToken.value;

                // Check precedence: Pop if op2 has greater or equal precedence than op1
                if (precedence[op2] >= precedence[op1]) {
                    outputQueue.push(topToken);
                    operatorStack.pop();
                } else {
                    break;
                }
            }
            operatorStack.push(token);

        } else if (token.type === 'PAREN') {
            if (token.value === '(') {
                operatorStack.push(token);
            } else if (token.value === ')') {
                // Pop operators until '(' is found
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
                    outputQueue.push(operatorStack.pop()!);
                }
                if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1].value !== '(') {
                    throw new Error("Parser Error: Mismatched parentheses.");
                }
                // Discard '('
                operatorStack.pop();
            }
        }
    }

    // Pop remaining operators from the stack to the output queue
    while (operatorStack.length > 0) {
        const opToken = operatorStack.pop();
        if (opToken!.type === 'PAREN') {
            throw new Error("Parser Error: Mismatched parentheses.");
        }
        outputQueue.push(opToken!);
    }

    return outputQueue;
}

/**
 * Evaluates the RPN token stream.
 * @param rpnTokens The array of RPN tokens.
 * @returns The result of the evaluation.
 */
function evaluateRpn(rpnTokens: Token[]): number {
    const stack: number[] = [];

    for (const token of rpnTokens) {
        if (token.type === 'NUMBER') {
            stack.push(token.value);
        } else if (token.type === 'OPERATOR') {
            const op = token.value;

            if (op === '+' || op === '-' || op === '*' || op === '/') {
                if (stack.length < 2) {
                    throw new Error("Evaluation Error: Insufficient operands.");
                }
                const B = stack.pop()!;
                const A = stack.pop()!;
                let result: number;

                switch (op) {
                    case '+':
                        result = A + B;
                        break;
                    case '-':
                        result = A - B;
                        break;
                    case '*':
                        result = A * B;
                        break;
                    case '/':
                        // Division truncates toward zero (integer division)
                        // Math.trunc ensures correct behavior for negative numbers.
                        result = Math.trunc(A / B);
                        break;
                }
                stack.push(result);
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error("Evaluation Error: Malformed expression.");
    }

    return stack[0];
}

/**
 * Main function to read input and run the evaluation pipeline.
 */
function main() {
    try {
        // Read all input from descriptor 0 (stdin)
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input) {
            // Handle empty input case
            console.log(0);
            return;
        }

        // 1. Lexing: Convert string to tokens
        const tokens = lexer(input);

        // 2. Parsing (Shunting Yard): Convert infix tokens to RPN
        const rpn = shuntingYard(tokens);

        // 3. Evaluation: Compute the result from RPN
        const result = evaluateRpn(rpn);

        console.log(result);

    } catch (error) {
        // In a production environment, we would log the error.
        // For this specific challenge format, we assume valid input or let the error propagate.
        // If robust error handling was required, we would output an error message.
        // console.error(error.message);
        // process.exit(1);
    }
}

main();
