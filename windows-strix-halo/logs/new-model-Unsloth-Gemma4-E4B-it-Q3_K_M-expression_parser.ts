import * as fs from 'fs';

// Define the precedence of operators
const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    // Unary operators are handled implicitly during tokenization/parsing
};

// Token structure
type Token = {
    type: 'number' | 'operator' | 'paren';
    value: string;
    isUnary: boolean; // Only relevant for '+' or '-'
};

/**
 * Tokenizes the input expression string.
 * Handles numbers, operators, and parentheses.
 * Also identifies unary operators.
 */
function tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    // State to determine if the next operator should be treated as unary
    // True if the previous token was an operator, an opening parenthesis, or if we are at the start.
    let expectingUnary = true;

    while (i < expression.length) {
        let char = expression[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // 1. Numbers
        if (/\d/.test(char)) {
            let numberStr = '';
            let j = i;
            while (j < expression.length && /\d/.test(expression[j])) {
                numberStr += expression[j];
                j++;
            }
            tokens.push({ type: 'number', value: numberStr, isUnary: false });
            i = j;
            expectingUnary = false;
            continue;
        }

        // 2. Parentheses
        if (char === '(' || char === ')') {
            tokens.push({ type: 'paren', value: char, isUnary: false });
            i++;
            // If we encounter a parenthesis, the next token might be a unary operator
            expectingUnary = (char === '(');
            continue;
        }

        // 3. Operators (+, -, *, /)
        if (['+', '-', '*', '/'].includes(char)) {
            const isUnary = char === '+' || char === '-' ? expectingUnary : false;
            
            // If it's a unary plus/minus, we treat it as an operator token
            if (isUnary && (char === '+' || char === '-')) {
                 tokens.push({ type: 'operator', value: char, isUnary: true });
            } else {
                 // Binary operator
                tokens.push({ type: 'operator', value: char, isUnary: false });
            }
            
            i++;
            // After an operator, the next token might be a unary operator
            expectingUnary = true;
            continue;
        }

        // Should not happen if input is valid
        throw new Error(`Unknown character encountered: ${char}`);
    }
    return tokens;
}

/**
 * Converts an infix token list to a postfix (RPN) token list using Shunting-Yard.
 */
function shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        } else if (token.type === 'operator' || (token.type === 'paren' && token.value === '(')) {
            // Operator or opening parenthesis
            if (token.type === 'operator') {
                const op1 = token;
                while (
                    operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1].type === 'operator' &&
                    (precedence[operatorStack[operatorStack.length - 1].value] >= precedence[op1.value])
                ) {
                    outputQueue.push(operatorStack.pop()!);
                }
                operatorStack.push(op1);
            } else if (token.type === 'paren' && token.value === '(') {
                operatorStack.push(token);
            }
        } else if (token.type === 'paren' && token.value === ')') {
            // Closing parenthesis
            let foundOpenParen = false;
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === 'paren' && top.value === '(') {
                    // Found the matching open parenthesis
                    operatorStack.pop(); // Discard '('
                    foundOpenParen = true;
                    break;
                }
                outputQueue.push(operatorStack.pop()!);
            }
            if (!foundOpenParen) {
                throw new Error("Mismatched parentheses.");
            }
        }
    }

    // Dump remaining operators from the stack to the output queue
    while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === 'paren' && top.value === '(') {
             throw new Error("Mismatched parentheses.");
        }
        outputQueue.push(operatorStack.pop()!);
    }

    return outputQueue;
}

/**
 * Evaluates the Reverse Polish Notation (RPN) token list.
 */
function evaluateRPN(tokens: Token[]): number {
    const stack: number[] = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(parseFloat(token.value));
        } else if (token.type === 'operator') {
            const op = token.value;
            let a: number;
            let b: number;

            if (token.isUnary) {
                // Unary operator (e.g., -5 or +5)
                a = stack.pop()!;
                if (op === '-') {
                    stack.push(-a);
                } else if (op === '+') {
                    stack.push(a);
                }
                continue;
            }

            // Binary operator
            if (stack.length < 2) {
                throw new Error("Invalid expression: not enough operands for binary operator.");
            }
            b = stack.pop()!;
            a = stack.pop()!;

            switch (op) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    // Division must truncate toward zero
                    if (b === 0) {
                        throw new Error("Division by zero.");
                    }
                    // Use Math.trunc to ensure truncation toward zero
                    stack.push(Math.trunc(a / b));
                    break;
                default:
                    throw new Error(`Unknown operator: ${op}`);
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error("Invalid expression: evaluation failed.");
    }
    
    // Return the final result, cast to integer as required by the problem description
    return Math.trunc(stack[0]);
}

/**
 * Main function to read input and execute the evaluation process.
 */
function main() {
    // Read all input from standard in (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();

    if (input === "") {
        // Handle empty input gracefully, though problem implies valid input
        console.log(0); 
        return;
    }

    try {
        // 1. Tokenize the expression
        const tokens = tokenize(input);

        // 2. Convert infix tokens to RPN (Postfix)
        const rpnTokens = shuntingYard(tokens);

        // 3. Evaluate the RPN tokens
        const result = evaluateRPN(rpnTokens);

        // Output the final integer result
        console.log(result);

    } catch (e) {
        // In a real-world scenario, we would log this error. 
        // For this constrained problem, we assume valid input structure.
        // console.error("Evaluation Error:", e.message); 
    }
}

main();
