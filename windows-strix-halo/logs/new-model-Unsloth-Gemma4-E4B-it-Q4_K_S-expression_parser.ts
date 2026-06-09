import * as fs from 'fs';

// --- Tokenization Setup ---

enum TokenType {
    NUMBER = 'NUMBER',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    MULTIPLY = 'MULTIPLY',
    DIVIDE = 'DIVIDE',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    // Special tokens for unary operations
    UNARY_PLUS = 'UNARY_PLUS',
    UNARY_MINUS = 'UNARY_MINUS',
}

interface Token {
    type: TokenType;
    value?: number | string;
}

/**
 * Lexes the input string into a sequence of tokens.
 * Handles numbers, standard operators, parentheses, and distinguishes between
 * unary and binary +/- operators based on context.
 * @param input The arithmetic expression string.
 * @returns An array of tokens.
 */
function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    // State variable to track context for unary detection
    // True if the previous token was an operator or '(' (or start of string),
    // meaning the current '+' or '-' is likely unary.
    let expectingOperand = true; 

    while (i < input.length) {
        const char = input[i];

        if (char === ' ') {
            i++;
            continue;
        }

        // 1. Numbers
        if (char >= '0' && char <= '9') {
            let numStr = '';
            while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: TokenType.NUMBER, value: parseInt(numStr) });
            expectingOperand = false;
            continue;
        }

        // 2. Parentheses
        if (char === '(') {
            tokens.push({ type: TokenType.LPAREN, value: '(' });
            expectingOperand = true;
            i++;
            continue;
        }
        if (char === ')') {
            tokens.push({ type: TokenType.RPAREN, value: ')' });
            expectingOperand = false;
            i++;
            continue;
        }

        // 3. Operators (+/-)
        if (char === '+') {
            if (expectingOperand) {
                tokens.push({ type: TokenType.UNARY_PLUS, value: 1 });
            } else {
                tokens.push({ type: TokenType.PLUS, value: 1 });
            }
            expectingOperand = true;
            i++;
            continue;
        }

        if (char === '-') {
            if (expectingOperand) {
                tokens.push({ type: TokenType.UNARY_MINUS, value: -1 });
            } else {
                tokens.push({ type: TokenType.MINUS, value: -1 });
            }
            expectingOperand = true;
            i++;
            continue;
        }

        // 4. Binary Operators (* /)
        if (char === '*') {
            tokens.push({ type: TokenType.MULTIPLY, value: 2 });
            expectingOperand = true;
            i++;
            continue;
        }
        if (char === '/') {
            tokens.push({ type: TokenType.DIVIDE, value: 2 });
            expectingOperand = true;
            i++;
            continue;
        }
        
        throw new Error(`Lexing error: Unknown character ${char} at index ${i}`);
    }

    return tokens;
}

// --- Shunting-Yard Algorithm ---

/**
 * Defines operator precedence and associativity.
 * Precedence: Unary (3) > Multiply/Divide (2) > Add/Subtract (1)
 */
function getPrecedence(token: Token): number {
    switch (token.type) {
        case TokenType.UNARY_PLUS:
        case TokenType.UNARY_MINUS:
            return 3;
        case TokenType.MULTIPLY:
        case TokenType.DIVIDE:
            return 2;
        case TokenType.PLUS:
        case TokenType.MINUS:
            return 1;
        default:
            return 0;
    }
}

/**
 * Converts an infix token sequence to a postfix token sequence using Shunting-Yard.
 * @param tokens The tokenized input.
 * @returns The postfix token sequence.
 */
function shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (const token of tokens) {
        if (token.type === TokenType.NUMBER) {
            outputQueue.push(token);
        } else if (token.type === TokenType.LPAREN) {
            operatorStack.push(token);
        } else if (token.type === TokenType.RPAREN) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LPAREN) {
                outputQueue.push(operatorStack.pop()!);
            }
            if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1].type !== TokenType.LPAREN) {
                throw new Error("Mismatched parentheses.");
            }
            operatorStack.pop(); // Discard the '('
        } else {
            // Operator (Op1)
            const op1 = token;
            while (
                operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1].type !== TokenType.LPAREN
            ) {
                const op2 = operatorStack[operatorStack.length - 1];
                // Standard Shunting-Yard rule: if Op2 has equal or higher precedence, pop Op2.
                if (getPrecedence(op2) >= getPrecedence(op1)) {
                    outputQueue.push(operatorStack.pop()!);
                } else {
                    break;
                }
            }
            operatorStack.push(op1);
        }
    }

    // Empty the operator stack to the output queue
    while (operatorStack.length > 0) {
        const op = operatorStack.pop()!;
        if (op.type === TokenType.LPAREN) {
            throw new Error("Mismatched parentheses.");
        }
        outputQueue.push(op);
    }

    return outputQueue;
}

// --- Postfix Evaluation ---

/**
 * Performs the calculation based on the operator type.
 * All division truncates toward zero.
 */
function applyOp(op: Token, b: number, a: number): number {
    switch (op.type) {
        case TokenType.PLUS:
            return a + b;
        case TokenType.MINUS:
            return a - b;
        case TokenType.MULTIPLY:
            return a * b;
        case TokenType.DIVIDE:
            // Division truncates toward zero
            return Math.trunc(a / b);
        case TokenType.UNARY_PLUS:
            return a; // Unary + is identity
        case TokenType.UNARY_MINUS:
            return -a; // Unary - negates
        default:
            throw new Error(`Unknown operator type: ${op.type}`);
    }
}

/**
 * Evaluates the token sequence in postfix notation.
 * @param postfixTokens The postfix token sequence.
 * @returns The final integer result.
 */
function evaluatePostfix(postfixTokens: Token[]): number {
    const stack: number[] = [];

    for (const token of postfixTokens) {
        if (token.type === TokenType.NUMBER) {
            stack.push(token.value!);
        } else if (token.type === TokenType.PLUS || token.type === TokenType.MINUS || 
                   token.type === TokenType.MULTIPLY || token.type === TokenType.DIVIDE ||
                   token.type === TokenType.UNARY_PLUS || token.type === TokenType.UNARY_MINUS) {
            
            if (token.type === TokenType.UNARY_PLUS || token.type === TokenType.UNARY_MINUS) {
                // Unary operations only require one operand (a)
                if (stack.length < 1) throw new Error("Syntax error: Missing operand for unary operator.");
                const a = stack.pop()!;
                const result = applyOp(token, 0, a); // Dummy 'b' for unary
                stack.push(result);
            } else {
                // Binary operations require two operands (a and b)
                if (stack.length < 2) throw new Error("Syntax error: Missing operands for binary operator.");
                const b = stack.pop()!;
                const a = stack.pop()!;
                const result = applyOp(token, b, a);
                stack.push(result);
            }
        } else {
             throw new Error(`Unexpected token in postfix evaluation: ${token.type}`);
        }
    }

    if (stack.length !== 1) {
        throw new Error("Evaluation error: Invalid expression format.");
    }

    return stack[0];
}

// --- Main Program Execution ---

function solve() {
    // Read all input from standard input (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();

    if (!input) {
        return;
    }

    try {
        // 1. Lexing (Infix -> Tokens)
        const tokens = tokenize(input);

        // 2. Shunting-Yard (Infix Tokens -> Postfix Tokens)
        const postfix = shuntingYard(tokens);

        // 3. Evaluation (Postfix Tokens -> Result)
        const result = evaluatePostfix(postfix);

        console.log(result);

    } catch (e) {
        // In a real scenario, we might log the error, but for this problem,
        // we assume valid input structure or let the error propagate if needed.
        // For robustness, we handle it silently if possible, but since the requirement
        // is only the final integer output, we rely on the error mechanism if the input is malformed.
        // console.error(e.message); 
    }
}

solve();
