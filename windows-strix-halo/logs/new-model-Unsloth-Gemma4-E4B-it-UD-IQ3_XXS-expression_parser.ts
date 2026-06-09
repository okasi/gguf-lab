import * as fs from 'fs';

// ----------------------------------------------------------------------------
// Token Definitions
// ----------------------------------------------------------------------------

type TokenType = 'number' | 'operator' | 'parenthesis';

interface Token {
    type: TokenType;
    value: string | number;
}

// ----------------------------------------------------------------------------
// Lexer (Tokenizer)
// ----------------------------------------------------------------------------

/**
 * Converts the raw expression string into a sequence of tokens.
 */
function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const operators = ['+', '-', '*', '/', '(', ')'];

    // Helper to check if the current character is a sign that can be unary
    function isUnaryStart(index: number, expression: string): boolean {
        if (index === 0) return true;
        const prevChar = expression[index - 1];
        // Unary if it follows an opening parenthesis or another operator
        return prevChar === '(' || ['+', '-', '*', '/'].includes(prevChar);
    }

    while (i < input.length) {
        let char = input[i];

        if (/\s/.test(char)) {
            i++;
            continue; // Skip whitespace
        }

        // 1. Numbers
        if (/\d/.test(char) || char === '.') {
            let numStr = '';
            while (i < input.length) {
                let nextChar = input[i];
                if (/\d/.test(nextChar) || nextChar === '.') {
                    numStr += nextChar;
                    i++;
                } else {
                    break;
                }
            }
            tokens.push({ type: 'number', value: parseFloat(numStr) });
            i++;
            continue;
        }

        // 2. Operators and Parentheses
        if (['+', '-', '*', '/', '('].includes(char)) {
            // Check for unary context
            let isUnary = false;
            if (['+', '-'].includes(char) && isUnaryStart(i, input)) {
                isUnary = true;
            }

            if (['+', '-', '*', '/'].includes(char)) {
                let operatorType = char;
                if (isUnary) {
                    // Treat unary operators as a special case. We use a reserved token
                    // to distinguish them in the RPN stack.
                    if (char === '+') {
                        tokens.push({ type: 'operator', value: 'U+' });
                    } else {
                        tokens.push({ type: 'operator', value: 'U-' });
                    }
                    i++;
                    continue;
                }
                
                // Binary operator
                tokens.push({ type: 'operator', value: char });
                i++;
                continue;
            }

            // Parentheses
            if (char === '(' || char === ')') {
                tokens.push({ type: 'parenthesis', value: char });
                i++;
                continue;
            }
        }
        
        // Should not happen if input is valid
        throw new Error(`Invalid character encountered: ${char}`);
    }

    return tokens;
}

// ----------------------------------------------------------------------------
// Shunting-Yard Algorithm (Infix to RPN)
// ----------------------------------------------------------------------------

const OPERATOR_PRECEDENCE = {
    'U+': 4, // Unary has highest precedence
    'U-': 4,
    '*': 2,
    '/': 2,
    '+': 1,
    '-': 1,
    '(': 0,
    ')': 0,
};

function shuntingYard(tokens: Token[]): string[] {
    const outputQueue: string[] = [];
    const operatorStack: string[] = [];

    for (const token of tokens) {
        const value = token.value;
        const type = token.type;

        if (type === 'number') {
            outputQueue.push(String(value));
        } else if (type === 'operator' || type === 'parenthesis') {
            // Token is an operator or parenthesis
            const opToken = value;

            if (opToken === '(') {
                operatorStack.push(opToken);
            } else if (opToken === ')') {
                // Pop stack until matching '(' is found
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop()!);
                }
                // Pop the '('
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
                    operatorStack.pop(); // Pop '('
                } else {
                    throw new Error("Mismatched parentheses");
                }
            } else {
                // Operator comparison logic
                while (operatorStack.length > 0) {
                    const stackOp = operatorStack[operatorStack.length - 1];
                    // Check precedence rules
                    const currentPrec = OPERATOR_PRECEDENCE[opToken];
                    const stackPrec = OPERATOR_PRECEDENCE[stackOp];

                    if (stackPrec > currentPrec || (stackPrec === currentPrec && opToken !== '(')) {
                        outputQueue.push(operatorStack.pop()!);
                    } else {
                        break;
                    }
                }
                operatorStack.push(opToken);
            }
        }
    }

    // Pop remaining operators from stack to output queue
    while (operatorStack.length > 0) {
        const topOp = operatorStack[operatorStack.length - 1];
        if (topOp === '(' || topOp === ')') {
             throw new Error("Mismatched parentheses");
        }
        outputQueue.push(operatorStack.pop()!);
    }

    return outputQueue;
}

// ----------------------------------------------------------------------------
// RPN Evaluator
// ----------------------------------------------------------------------------

/**
 * Performs the arithmetic operation based on the operator token.
 */
function calculate(op: string, b: number, a: number): number {
    // Note: The RPN stack stores the second operand (b) then the first (a).
    // We use standard infix notation (a op b) internally.

    if (op === 'U+') return a;
    if (op === 'U-') return a; // Unary minus is handled by treating it as 0-a or a specialized function
    
    // Since the RPN stack structure is [..., b, a] and we pop them as b then a, 
    // we must ensure the evaluation function respects that order.
    // For binary ops, the structure is: [..., b, a] -> pop a, pop b. Result is a op b.
    
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    
    // Truncate division toward zero
    if (op === '/') return Math.trunc(a / b);
    
    throw new Error(`Unknown operator: ${op}`);
}

/**
 * Evaluates the expression from RPN notation.
 */
function evaluateRPN(rpnTokens: string[]): number {
    const stack: number[] = [];

    for (const tokenStr of rpnTokens) {
        if (tokenStr.match(/^-?\d+(\.\d+)?$/)) {
            // Operand (number)
            const num = parseFloat(tokenStr);
            stack.push(num);
        } else {
            // Operator
            const op = tokenStr;

            if (op === 'U+' || op === 'U-') {
                // Unary operators need only one operand
                if (stack.length < 1) throw new Error("Not enough operands for unary operator.");
                const operand = stack.pop()!;
                
                // Special handling for Unary Minus
                if (op === 'U-') {
                    stack.push(-operand);
                } else { // U+
                    stack.push(operand);
                }
                continue;
            }
            
            // Binary operators
            if (stack.length < 2) throw new Error("Not enough operands for binary operator.");
            
            // Pop the operands (order is crucial: popped B is the second operand, A is the first)
            const B = stack.pop()!;
            const A = stack.pop()!;

            // Calculate result and push back
            const result = calculate(op, B, A);
            stack.push(result);
        }
    }

    if (stack.length !== 1) {
        throw new Error("Invalid expression structure. Stack size is not 1.");
    }

    return stack[0];
}


// ----------------------------------------------------------------------------
// Main Execution
// ----------------------------------------------------------------------------

function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    
    if (!input) {
        // Handle empty input case
        console.log(0); 
        return;
    }

    try {
        // 1. Tokenize the input string
        const tokens = tokenize(input);

        // 2. Convert tokens to RPN queue
        const rpnTokens = shuntingYard(tokens);

        // 3. Evaluate RPN
        const result = evaluateRPN(rpnTokens);

        console.log(result);

    } catch (e) {
        // In a production environment, we might handle errors gracefully.
        // For competitive programming constraints, we assume valid input or crash.
        // console.error(e.message); 
    }
}

solve();
