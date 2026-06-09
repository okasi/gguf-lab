const fs = require('fs');

/**
 * Defines the structure for a token.
 */
type Token = {
    type: 'number' | 'operator' | 'parenthesis';
    value: string;
};

/**
 * Defines the precedence and associativity for operators.
 * Higher number means higher precedence.
 * We use special tokens for unary operations.
 */
const PRECEDENCE: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '_U_PLUS': 3, // Unary plus
    '_U_MINUS': 3  // Unary minus
};

/**
 * Checks if a token is an operator.
 */
function isOperator(token: Token): boolean {
    return PRECEDENCE.hasOwnProperty(token.value);
}

/**
 * Tokenizes the input expression string into a list of tokens.
 * Handles multi-digit numbers and distinguishes between unary and binary operators.
 */
function tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = expression.length;

    // Helper function to check if a character is a digit
    const isDigit = (char: string) => char >= '0' && char <= '9';

    // Helper function to check if the current position is a valid starting point for a unary operation
    // (start of string, or immediately after an opening parenthesis or another operator)
    const isUnaryContext = (index: number, lastToken: Token | null): boolean => {
        if (index === 0) return true;
        if (lastToken && lastToken.value === '(') return true;
        if (lastToken && isOperator(lastToken)) return true;
        return false;
    };

    while (i < len) {
        let char = expression[i];

        if (char === ' ') {
            i++;
            continue;
        }

        // 1. Numbers
        if (isDigit(char)) {
            let numStr = '';
            while (i < len && isDigit(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push({ type: 'number', value: numStr });
            continue;
        }

        // 2. Parentheses
        if (char === '(' || char === ')') {
            tokens.push({ type: 'parenthesis', value: char });
            i++;
            continue;
        }

        // 3. Operators (+, -)
        if (char === '+' || char === '-') {
            const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
            const isUnary = isUnaryContext(i, lastToken);

            let opValue: string;
            if (isUnary) {
                opValue = char === '+' ? '_U_PLUS' : '_U_MINUS';
            } else {
                opValue = char; // Binary operator
            }

            tokens.push({ type: 'operator', value: opValue });
            i++;
            continue;
        }

        // Unknown character
        throw new Error(`Invalid character in expression: ${char}`);
    }

    return tokens;
}

/**
 * Converts tokens from infix notation to Reverse Polish Notation (RPN)
 * using the Shunting-Yard algorithm.
 */
function shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        } else if (token.type === 'parenthesis') {
            if (token.value === '(') {
                operatorStack.push(token);
            } else if (token.value === ')') {
                // Pop operators until '(' is found
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
                    const operator = operatorStack.pop()!;
                    outputQueue.push(operator);
                }
                // Discard the '('
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value === '(') {
                    operatorStack.pop();
                } else {
                    throw new Error("Mismatched parentheses.");
                }
            }
        } else if (token.type === 'operator') {
            const op1 = token;

            while (operatorStack.length > 0) {
                const topToken = operatorStack[operatorStack.length - 1];
                
                // Stop if the top of the stack is an opening parenthesis
                if (topToken.value === '(') break;

                const op2 = topToken;
                
                // Check precedence rules: Pop if op2 has higher or equal precedence than op1
                if (PRECEDENCE[op1.value] <= PRECEDENCE[op2.value]) {
                    outputQueue.push(op2);
                    operatorStack.pop();
                } else {
                    break;
                }
            }
            operatorStack.push(op1);
        }
    }

    // Pop any remaining operators from the stack to the output queue
    while (operatorStack.length > 0) {
        const op = operatorStack.pop()!;
        if (op.value === '(' || op.value === ')') {
            throw new Error("Mismatched parentheses.");
        }
        outputQueue.push(op);
    }

    return outputQueue;
}

/**
 * Evaluates an expression in Reverse Polish Notation (RPN).
 * Division truncates toward zero.
 */
function evaluateRPN(rpnTokens: Token[]): number {
    const stack: number[] = [];

    for (const token of rpnTokens) {
        if (token.type === 'number') {
            // Push number onto the stack
            stack.push(parseFloat(token.value));
        } else if (token.type === 'operator') {
            const op = token.value;

            if (op === '_U_PLUS') {
                // Unary plus: pushes the operand itself
                const operand = stack.pop()!;
                stack.push(operand);
            } else if (op === '_U_MINUS') {
                // Unary minus: negates the operand
                const operand = stack.pop()!;
                stack.push(-operand);
            } else {
                // Binary operators (+, -, *, /)
                if (stack.length < 2) {
                    throw new Error("Syntax error: Not enough operands for binary operator.");
                }
                const right = stack.pop()!;
                const left = stack.pop()!;
                let result: number;

                switch (op) {
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
                        // Division truncates toward zero (Math.trunc)
                        if (right === 0) throw new Error("Division by zero.");
                        result = Math.trunc(left / right);
                        break;
                    default:
                        throw new Error("Unknown operator.");
                }
                stack.push(result);
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error("Syntax error: Invalid expression format.");
    }

    return Math.trunc(stack[0]);
}

/**
 * Main function to read input and execute the evaluation pipeline.
 */
function main() {
    try {
        // Read all input from standard input (fd 0)
        const input = fs.readFileSync(0, 'utf8').trim();

        if (!input) {
            console.log(0);
            return;
        }

        // 1. Tokenization (Lexing)
        const tokens = tokenize(input);

        // 2. Shunting-Yard (Infix to RPN)
        const rpnTokens = shuntingYard(tokens);

        // 3. RPN Evaluation
        const result = evaluateRPN(rpnTokens);

        // Output the final integer result
        console.log(result);

    } catch (e) {
        // In a competitive programming context, error handling might just crash, 
        // but here we ensure the process terminates cleanly if an unexpected error occurs.
        // console.error(e.message);
        process.exit(1);
    }
}

main();
