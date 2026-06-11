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
 * Evaluates an arithmetic expression.
 * Supports +, -, *, /, and unary +/-, with parentheses.
 * Division truncates toward zero.
 * @param expression The arithmetic expression string.
 * @returns The integer result of the expression.
 */
function evaluate(expression) {
    // Tokenization and Preprocessing
    let tokens = [];
    let i = 0;
    const len = expression.length;
    // Insert spaces around operators and parentheses to simplify splitting,
    // but handle existing spaces correctly.
    let processedExpression = expression
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .replace(/\*/g, " * ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " - ");
    // Clean up multiple spaces
    while (processedExpression.includes("  ")) {
        processedExpression = processedExpression.replace("  ", " ");
    }
    tokens = processedExpression.trim().split(" ").filter(token => token.length > 0);
    // Shunting-Yard implementation to convert infix to postfix (RPN)
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };
    const outputQueue = [];
    const operatorStack = [];
    for (let token of tokens) {
        if (!isNaN(parseInt(token))) {
            // Token is a number
            outputQueue.push(token);
        }
        else if (token === '(') {
            operatorStack.push(token);
        }
        else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop(); // Remove '('
        }
        else if (precedence[token]) {
            // Token is an operator (+, -, *, /)
            while (operatorStack.length > 0 &&
                operatorStack[operatorStack.length - 1] !== '(' &&
                precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        }
        else {
            // Handle Unary operators (+/-)
            // If the token is + or -, and it's the first token, or preceded by '(', or preceded by another operator, it's unary.
            const isUnary = token === '+' || token === '-';
            let isUnaryContext = false;
            if (tokens.indexOf(token) === 0) {
                isUnaryContext = true;
            }
            else {
                const prevIndex = tokens.indexOf(token) - 1;
                if (prevIndex >= 0) {
                    const prevToken = tokens[prevIndex];
                    if (prevToken === '(' || precedence[prevToken]) {
                        isUnaryContext = true;
                    }
                }
            }
            if (isUnary && isUnaryContext) {
                // Represent unary plus as the number itself, and unary minus as a negation operation (0 - X)
                if (token === '+') {
                    outputQueue.push("0");
                    outputQueue.push("+");
                }
                else { // token === '-'
                    outputQueue.push("0");
                    outputQueue.push("-");
                }
            }
            else {
                // Standard binary operator handling (should already be handled above, but this catches any edge cases in tokenization)
                // If it reached here and is + or -, it must be binary based on how the logic above was structured.
                while (operatorStack.length > 0 &&
                    operatorStack[operatorStack.length - 1] !== '(' &&
                    precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        }
    }
    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop());
    }
    // RPN Evaluation
    const evaluationStack = [];
    for (let token of outputQueue) {
        if (!isNaN(parseInt(token))) {
            evaluationStack.push(parseInt(token));
        }
        else {
            const b = evaluationStack.pop();
            const a = evaluationStack.pop();
            let result;
            switch (token) {
                case '+':
                    result = a + b;
                    break;
                case '-':
                    result = a - b;
                    break;
                case '*':
                    result = a * b;
                    break;
                case '/':
                    // Division truncates toward zero (Math.trunc is equivalent for integer division here)
                    result = Math.trunc(a / b);
                    break;
                default:
                    // Should not happen if tokenization and shunting-yard are correct
                    throw new Error(`Unknown token: ${token}`);
            }
            evaluationStack.push(result);
        }
    }
    return evaluationStack[0];
}
// Main execution block
try {
    // Read all input from standard in (file descriptor 0)
    const input = fs.readFileSync(0, "utf8").trim();
    if (input.length > 0) {
        const result = evaluate(input);
        console.log(result);
    }
}
catch (e) {
    // Handle potential errors during file read or evaluation, though the prompt implies valid input.
    // In a contest setting, this block might just be empty or handle specific error codes.
}
