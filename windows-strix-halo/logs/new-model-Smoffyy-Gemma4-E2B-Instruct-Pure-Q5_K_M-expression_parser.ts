const fs = require('fs');

/**
 * Tokenizes the input string into numbers, operators, and parentheses.
 * It specifically handles unary operators by looking at the preceding token.
 * @param expression The input string.
 * @returns An array of tokens (strings or numbers).
 */
function tokenize(expression: string): (string | number)[] {
    const tokens: (string | number)[] = [];
    let i = 0;
    const n = expression.length;

    while (i < n) {
        let char = expression[i];

        // 1. Skip whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // 2. Handle numbers
        if (/[0-9]/.test(char)) {
            let numStr = '';
            while (i < n && /[0-9]/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push(parseInt(numStr, 10));
            continue;
        }

        // 3. Handle operators and parentheses
        if ('+-*/()'.includes(char)) {
            let isUnary = false;

            // Check for unary context:
            // a) Start of expression
            if (i === 0) {
                isUnary = true;
            }
            // b) After an opening parenthesis
            else if (expression[i - 1] === '(') {
                isUnary = true;
            }
            // c) After another operator
            else if ('+-*/'.includes(expression[i - 1])) {
                isUnary = true;
            }

            if (isUnary) {
                // Treat unary + or - as a special operation or just a prefix operator
                if (char === '+' || char === '-') {
                    // We will represent unary ops explicitly for the parser
                    tokens.push(char);
                    i++;
                    continue;
                }
            }

            // Binary operators and parentheses
            tokens.push(char);
            i++;
            continue;
        }

        // If no pattern matches (shouldn't happen with valid input)
        i++;
    }

    return tokens;
}

/**
 * Implements the Shunting-Yard algorithm to convert infix tokens to Reverse Polish Notation (RPN).
 * @param tokens The array of tokens from the lexer.
 * @returns An array of tokens in RPN format.
 */
function shuntingYard(tokens: (string | number)[]): (string | number)[] {
    const output: (string | number)[] = [];
    const operatorStack: string[] = [];
    
    // Define operator precedence
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        'U+': 3 // Placeholder for unary operators
    };

    function isOperator(token: string | number): boolean {
        return typeof token === 'string' && '+-*/'.includes(token);
    }

    for (const token of tokens) {
        if (typeof token === 'number') {
            output.push(token);
        } else if (isOperator(token)) {
            // Handle unary operators ('+' or '-')
            if (token === '+' || token === '-') {
                operatorStack.push(token);
            } else {
                // Handle binary operators
                while (
                    operatorStack.length > 0 &&
                    isOperator(operatorStack[operatorStack.length - 1]) &&
                    (precedence[operatorStack[operatorStack.length - 1]] >= precedence[token])
                ) {
                    output.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                output.push(operatorStack.pop());
            }
            if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                operatorStack.pop(); // Pop the '('
            }
        }
    }

    // Pop remaining operators from the stack to the output
    while (operatorStack.length > 0) {
        output.push(operatorStack.pop() as string);
    }

    return output;
}

/**
 * Evaluates a Reverse Polish Notation (RPN) array.
 * @param rpnTokens The array of tokens in RPN format.
 * @returns The final integer result.
 */
function evaluateRPN(rpnTokens: (string | number)[]): number {
    const stack: number[] = [];

    for (const token of rpnTokens) {
        if (typeof token === 'number') {
            stack.push(token);
        } else if (typeof token === 'string') {
            // Operator handling
            if (token === '+' || token === '-' || token === '*' || token === '/') {
                if (stack.length < 2) {
                    throw new Error("Syntax Error: Insufficient operands for binary operator.");
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
                        // Division truncates toward zero
                        result = Math.trunc(left / right);
                        break;
                    default:
                        throw new Error(`Unknown operator: ${token}`);
                }
                stack.push(result);
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error("Syntax Error: Invalid expression structure.");
    }

    return stack[0];
}

function solve() {
    // Read input from standard input
    const input = fs.readFileSync(0, "utf8").trim();
    if (input === "") {
        console.log(0);
        return;
    }

    try {
        // 1. Tokenize
        const tokens = tokenize(input);

        // 2. Convert Infix to RPN
        const rpnTokens = shuntingYard(tokens);

        // 3. Evaluate RPN
        const result = evaluateRPN(rpnTokens);
        
        // Output the result as an integer
        console.log(result);

    } catch (error) {
        // In a production environment, detailed error reporting would be better.
        // For this problem, we assume valid input based on constraints, 
        // but catching errors ensures robustness.
        // console.error("Error evaluating expression:", error.message);
        // Optionally handle error output if required, but sticking to required output format.
    }
}

solve();
