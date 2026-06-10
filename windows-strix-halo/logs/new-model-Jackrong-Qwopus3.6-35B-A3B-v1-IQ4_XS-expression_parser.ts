import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

// Tokenizer: splits the expression into numbers, operators, and parentheses
type Token = { type: 'number', value: number } |
           { type: 'operator', value: string } |
           { type: 'paren', value: string };

function tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = expr.length;

    while (i < len) {
        const char = expr[i];

        // Skip spaces
        if (char === ' ' || char === '\t') {
            i++;
            continue;
        }

        // Handle numbers (integers)
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < len && /\d/.test(expr[i])) {
                numStr += expr[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseInt(numStr, 10) });
            continue;
        }

        // Handle operators and parentheses
        if (char === '+' || char === '-' || char === '*' || char === '/' || char === '(' || char === ')') {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }

        // Unknown character, skip or throw (skipping for robustness)
        i++;
    }

    return tokens;
}

// Shunting-yard algorithm to convert Infix to Postfix (RPN)
// Precedence:
// - Unary +/-: highest (let's say 4)
// - * /: medium (3)
// - + -: lowest (2)
// Parentheses handling is standard.

function getPrecedence(op: string, isUnary: boolean): number {
    if (isUnary) return 4;
    if (op === '*' || op === '/') return 3;
    if (op === '+' || op === '-') return 2;
    return 0;
}

function infixToPostfix(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const operatorStack: Token[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'number') {
            output.push(token);
        } else if (token.type === 'operator') {
            // Determine if unary
            let isUnary = false;
            if (token.value === '+' || token.value === '-') {
                // It's unary if:
                // 1. It's the first token
                // 2. The previous token was an operator
                // 3. The previous token was an opening parenthesis
                if (i === 0) {
                    isUnary = true;
                } else {
                    const prevToken = tokens[i - 1];
                    if (prevToken.type === 'operator' || 
                        (prevToken.type === 'paren' && prevToken.value === '(')) {
                        isUnary = true;
                    }
                }
            }

            // If the token is a right parenthesis, pop until left parenthesis
            if (token.value === ')') {
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
                    output.push(operatorStack.pop()!);
                }
                if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value === '(') {
                    operatorStack.pop(); // Pop the '('
                }
                continue;
            }

            // If the token is a left parenthesis, push to operator stack
            if (token.value === '(') {
                operatorStack.push(token);
                continue;
            }

            // For other operators, pop from stack while precedence is higher or equal
            // Note: Unary operators have higher precedence, so they won't be popped by * / + -
            // But we need to handle associativity. Unary is right-associative usually, but 
            // for simplicity in this specific problem, let's assume standard behavior.
            // Actually, standard shunting yard:
            // While there is an operator token on the operator stack and its precedence is 
            // greater than or equal to the current token's precedence (and left-associative), pop.
            
            const currentPrecedence = getPrecedence(token.value, isUnary);
            
            while (operatorStack.length > 0) {
                const topOp = operatorStack[operatorStack.length - 1];
                if (topOp.type !== 'operator') break; // Should not happen as we push operators

                const topIsUnary = (topOp.value === '+' || topOp.value === '-');
                const topPrecedence = getPrecedence(topOp.value, topIsUnary);

                if (currentPrecedence <= topPrecedence) {
                    // Pop the top operator
                    output.push(operatorStack.pop()!);
                } else {
                    break;
                }
            }

            // Push current operator to stack
            operatorStack.push(token);
        } else if (token.type === 'paren') {
            // Left parenthesis handled above
            // Right parenthesis handled above
        }
    }

    // Pop all remaining operators
    while (operatorStack.length > 0) {
        output.push(operatorStack.pop()!);
    }

    return output;
}

// Evaluate the Postfix expression
function evaluatePostfix(tokens: Token[]): number {
    const stack: number[] = [];

    for (const token of tokens) {
        if (token.type === 'number') {
            stack.push(token.value);
        } else if (token.type === 'operator') {
            // Pop operands from stack
            const right = stack.pop();
            const left = stack.pop();

            if (left === undefined || right === undefined) {
                throw new Error("Invalid expression");
            }

            let result: number;
            switch (token.value) {
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
                    // In JavaScript, integer division / truncates toward zero for positive numbers,
                    // but for negative numbers, it does not truncate toward zero in the same way
                    // as C/C++/Java (e.g., -7 / 2 = -3.5 -> -3 in JS, but -7/2 = -3.5 -> -3 in C++? No, -7/2 = -3 in C++?
                    // Actually, in C++11, -7 / 2 = -3. In JS, -7 / 2 = -3.5.
                    // We need to truncate toward zero.
                    result = Math.trunc(left / right);
                    break;
                default:
                    throw new Error(`Unknown operator: ${token.value}`);
            }
            stack.push(result);
        }
    }

    if (stack.length !== 1) {
        throw new Error("Invalid expression");
    }

    return stack[0];
}

// Main execution
try {
    const tokens = tokenize(input);
    const postfix = infixToPostfix(tokens);
    const result = evaluatePostfix(postfix);
    console.log(result);
} catch (e) {
    console.error(e);
}
