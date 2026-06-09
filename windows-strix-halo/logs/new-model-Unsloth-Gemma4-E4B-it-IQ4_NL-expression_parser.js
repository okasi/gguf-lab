"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
/**
 * Defines the precedence and associativity of operators.
 * Higher number means higher precedence.
 */
const Precedence = {
    // Unary operators (highest precedence)
    UNARY: 4,
    // Multiplication and Division
    MUL_DIV: 3,
    // Addition and Subtraction (Binary)
    ADD_SUB: 2,
    // Lowest precedence
    LOWEST: 1,
};
/**
 * Checks if a token is a recognized operator.
 */
function isOperator(token) {
    return ["+", "-", "*", "/"].includes(token.value);
}
/**
 * Gets the precedence level of an operator.
 * Note: This function needs context to distinguish unary vs. binary operators.
 * We assume the tokenizer handles the context, but for simplicity in the SY logic,
 * we rely on the operator definition itself.
 */
function getPrecedence(operator) {
    switch (operator) {
        case "*":
        case "/":
            return Precedence.MUL_DIV;
        case "+":
        case "-":
            // If we were to differentiate unary/binary strictly here, we would need
            // the surrounding context, but we structure the tokenizer to handle this.
            // For now, we default to binary precedence, relying on the tokenizer
            // to ensure unary operations appear correctly.
            return Precedence.ADD_SUB;
        default:
            return 0;
    }
}
/**
 * Tokenizes the input expression string.
 * Handles multi-digit numbers, parentheses, and differentiates unary/binary signs.
 */
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    // Tracks if the last token was a number or closing parenthesis.
    // If true, the current '+' or '-' must be binary.
    let expectsBinaryOperator = false;
    while (i < expression.length) {
        let char = expression[i];
        if (char === ' ') {
            i++;
            continue;
        }
        // 1. Numbers
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < expression.length && /\d/.test(expression[i])) {
                numStr += expression[i];
                i++;
            }
            tokens.push({ type: "number", value: parseInt(numStr, 10) });
            expectsBinaryOperator = false;
            continue;
        }
        // 2. Parentheses
        if (char === '(') {
            tokens.push({ type: "paren", value: "(" });
            expectsBinaryOperator = true; // After '(', we expect a value or unary sign
            i++;
            continue;
        }
        if (char === ')') {
            tokens.push({ type: "paren", value: ")" });
            expectsBinaryOperator = false; // After ')', we expect a binary operator
            i++;
            continue;
        }
        // 3. Operators (+, -, *, /)
        if (["+", "-", "*", "/"].includes(char)) {
            let op = char;
            let token;
            // Check for Unary vs Binary Sign
            if (op === "+" || op === "-") {
                // If we expect a binary operator, it's binary.
                // Otherwise (start of expression, after '('), it's unary.
                if (expectsBinaryOperator || tokens.length === 0) {
                    // Treat unary signs by inserting a zero (e.g., -5 becomes 0 - 5).
                    // This simplifies the Shunting-Yard logic by making all signs binary.
                    // We push 0, then the sign.
                    tokens.push({ type: "number", value: 0 });
                    op = op; // The operator remains + or -
                    expectsBinaryOperator = true;
                }
                else {
                    // Binary operator
                    expectsBinaryOperator = true;
                }
            }
            else {
                // *, / are always binary
                expectsBinaryOperator = true;
            }
            token = { type: "operator", value: op };
            tokens.push(token);
            i++;
            continue;
        }
        // Should not happen if input is well-formed
        throw new Error(`Unknown character: ${char}`);
    }
    return tokens;
}
/**
 * Converts the token sequence (Infix) into Reverse Polish Notation (Postfix)
 * using the Shunting-Yard algorithm.
 */
function shuntingYard(tokens) {
    const output = [];
    const operatorStack = [];
    const isParen = (token) => token.type === "paren";
    const isOperatorToken = (token) => token.type === "operator";
    const isNumberToken = (token) => token.type === "number";
    for (const token of tokens) {
        if (isNumberToken(token)) {
            output.push(token.value.toString());
        }
        else if (isOperatorToken(token)) {
            const op1 = token.value;
            const p1 = getPrecedence(op1);
            while (operatorStack.length > 0 &&
                !isParen(operatorStack[operatorStack.length - 1])) {
                const op2 = operatorStack[operatorStack.length - 1];
                const p2 = getPrecedence(op2);
                // Left associativity is assumed for all standard binary operators
                if (p2 >= p1) {
                    output.push(operatorStack.pop());
                }
                else {
                    break;
                }
            }
            operatorStack.push(op1);
        }
        else if (token.value === "(") {
            operatorStack.push(token.value);
        }
        else if (token.value === ")") {
            while (operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1] !== "(") {
                output.push(operatorStack.pop());
            }
            if (operatorStack[operatorStack.length - 1] === "(") {
                operatorStack.pop(); // Discard '('
            }
        }
    }
    // Pop remaining operators from the stack
    while (operatorStack.length > 0) {
        const op = operatorStack.pop();
        if (op === "(" || op === ")") {
            throw new Error("Mismatched parentheses");
        }
        output.push(op);
    }
    return output;
}
/**
 * Evaluates the expression represented in Postfix Notation.
 * Division truncates toward zero.
 */
function evaluatePostfix(postfixTokens) {
    const stack = [];
    for (const token of postfixTokens) {
        if (!isNaN(Number(token))) {
            // It's a number
            stack.push(Number(token));
        }
        else {
            // It's an operator
            const op = token;
            if (stack.length < 2) {
                throw new Error("Invalid postfix expression: insufficient operands.");
            }
            // Operands are popped in reverse order: op2 then op1
            const right = stack.pop();
            const left = stack.pop();
            let result;
            switch (op) {
                case "+":
                    result = left + right;
                    break;
                case "-":
                    result = left - right;
                    break;
                case "*":
                    result = left * right;
                    break;
                case "/":
                    // Division truncates toward zero (Math.trunc handles this perfectly)
                    result = Math.trunc(left / right);
                    break;
                default:
                    throw new Error(`Unknown operator: ${op}`);
            }
            stack.push(result);
        }
    }
    if (stack.length !== 1) {
        throw new Error("Invalid postfix expression: too many operands.");
    }
    return stack[0];
}
/**
 * Main function to read input, parse, and evaluate the expression.
 */
function main() {
    try {
        // Read all input from standard input synchronously
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input) {
            return;
        }
        // 1. Tokenize
        const tokens = tokenize(input);
        // 2. Convert to Postfix
        const postfix = shuntingYard(tokens);
        // 3. Evaluate Postfix
        const result = evaluatePostfix(postfix);
        // Output the result
        console.log(result);
    }
    catch (e) {
        // In a real scenario, we might log the error, but here we just exit cleanly.
        // console.error("Error during evaluation:", e.message);
    }
}
main();
