import * as fs from "fs";

type Token = number | string;
type Value = number;

/**
 * Determines the precedence of an operator.
 * @param op The operator
 * @returns A number representing precedence (lower is weaker)
 */
function getPrecedence(op: string): number {
    switch (op) {
        case '+':
        case '-':
            return 1;
        case '*':
        case '/':
            return 2;
        default:
            return 3;
    }
}

/**
 * Applies an operator to two operands.
 * @param left The left operand
 * @param right The right operand
 * @param op The operator
 * @returns The result of the operation
 */
function applyOperator(left: Value, right: Value, op: string): Value {
    switch (op) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            return Math.trunc(left / right);
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Tokenizes the input string into numbers and operators.
 * @param input The expression string
 * @returns An array of tokens
 */
function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    // Regex to match numbers (including optional leading sign), operators, and parentheses
    const tokenRegex = /[-+]?\d+|[+\-*/()]|/g;
    const matches = input.match(tokenRegex);

    if (!matches) {
        throw new Error("No tokens found in input");
    }

    return matches.map(t => {
        if (/^[-+]?\d+$/.test(t))) {
            return Number(t);
        }
        return t;
    });
}

/**
 * Converts infix tokens to postfix (RPN) using the Shunting-Yard algorithm.
 * @param tokens The array of tokens
 * @returns The array of postfix operators and operands
 */
function toPostfix(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const operators: string[] = [];

    for (const token of tokens) {
        if (typeof token === 'number') {
            output.push(token);
        } else if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                output.push(operators.pop() as Token);
            }
            if (operators.length === 0 || operators[operators.length - 1] !== '(') {
                throw new Error("Mismatched parentheses");
            }
            operators.pop() as Token; // Pop '('
        } else if (token === '+' || token === '-') {
            const currentPrecedence = getPrecedence(token);
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                const top = operators[operators.length - 1] as Token;
                if (getPrecedence(operators[operators.length - 1]) >= currentPrecedence) {
                    output.push(operators.pop() as Token);
                } else {
                    break;
                }
            }
            operators.push(token) as Token;
        } else {
            throw new Error(`Unknown token: ${token}`);
        }
    }

    while (operators.length > 0) {
        if (operators[operators.length - 1] !== '(') {
            output.push(operators.pop() as Token);
        } else {
            throw new Error("Mismatched parentheses");
        }
    }

    return output;
}

/**
 * Evaluates a Reverse Polish Notation (RPN) expression.
 * @param tokens The array of postfix operators and operands
 * @returns The result of the evaluation
 */
function evaluateRPN(tokens: Token[]): Value {
    const stack: Value[] = [];

    for (const token of tokens) {
        if (typeof token === 'number') {
            stack.push(token);
        } else if (token === '(') {
            throw new Error("Unexpected open parenthesis in RPN");
        } else if (token === ')') {
            const op = operators.pop() as Token;
            if (op === '(') {
                throw new Error("Mismatched parentheses");
            }
            const right = stack.pop() as Value;
            const left = stack.pop() as Value;
            const result = applyOperator(left, right, op);
            stack.push(result);
        } else if (token === '+' || token === '-') {
            const currentPrecedence = getPrecedence(token);
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                const top = operators[operators.length - 1] as Token;
                if (getPrecedence(operators[operators.length - 1]) >= currentPrecedence) {
                    output.push(operators.pop() as Token);
                } else {
                    break;
                }
            }
            operators.push(token) as Token;
        } else {
            throw new Error(`Unknown token: ${token}`);
        }
    }

    while (operators.length > 0) {
        if (operators[operators.length - 1] !== '(') {
            output.push(operators.pop() as Token);
        } else {
            throw new Error("Mismatched parentheses");
        }
    }

    return stack.pop() as Value;
}

try {
    const input = fs.readFileSync(0, "utf8");
    const tokens = tokenize(input);
    const postfix = toPostfix(tokens);
    const result = evaluateRPN(postfix);

    console.log(result);
} catch (e) {
    process.exit(1);
}
