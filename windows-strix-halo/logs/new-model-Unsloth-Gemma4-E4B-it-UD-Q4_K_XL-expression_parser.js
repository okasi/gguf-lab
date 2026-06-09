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
 * Defines the precedence of operators. Higher number means higher precedence.
 * Unary operators have the highest precedence.
 */
var Precedence;
(function (Precedence) {
    Precedence[Precedence["NONE"] = 0] = "NONE";
    Precedence[Precedence["ADD_SUB"] = 1] = "ADD_SUB";
    Precedence[Precedence["MULT_DIV"] = 2] = "MULT_DIV";
    Precedence[Precedence["UNARY"] = 3] = "UNARY";
})(Precedence || (Precedence = {}));
/**
 * Lexer/Tokenizer: Converts the input string into a list of tokens.
 * It specifically handles differentiating between unary and binary +/-.
 * @param input The raw expression string.
 * @returns An array of Token objects.
 */
function tokenize(input) {
    const tokens = [];
    let i = 0;
    // Helper to check if the current position allows for a unary operator
    const isPotentialUnaryPosition = (index) => {
        if (index === 0)
            return true;
        const prevToken = tokens[tokens.length - 1];
        return prevToken?.type === 'operator' || prevToken?.type === 'parenthesis' && prevToken.symbol === '(';
    };
    while (i < input.length) {
        let char = input[i];
        // 1. Skip Whitespace
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        // 2. Numbers
        if (/[0-9]/.test(char)) {
            let numStr = '';
            let start = i;
            while (i < input.length && /[0-9]/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'number', value: parseInt(numStr, 10) });
            continue;
        }
        // 3. Parentheses
        if (char === '(' || char === ')') {
            tokens.push({ type: 'parenthesis', symbol: char === '(' ? '(' : ')' });
            i++;
            continue;
        }
        // 4. Operators (+, -, *, /, ...)
        if (['+', '-', '*', '/', '.'].includes(char)) {
            let symbol = char;
            let isUnary = false;
            // Check for unary use of +/-
            if (char === '+' || char === '-') {
                if (isPotentialUnaryPosition(i)) {
                    isUnary = true;
                }
            }
            // If it's a number following a sign (e.g., -5), capture the sign as part of the number
            // This is complex, so we rely on the token stream logic:
            // If it's unary, we treat it as a special operator token
            if (isUnary) {
                let nextChar = input[i + 1];
                if (/[0-9]/.test(nextChar)) {
                    // Capture sign and number together
                    let numStr = symbol + nextChar;
                    i++;
                    while (i < input.length && /[0-9]/.test(input[i])) {
                        numStr += input[i];
                        i++;
                    }
                    const value = parseInt(numStr, 10);
                    tokens.push({ type: 'number', value: value });
                    continue;
                }
            }
            // Handle standard operators (binary or non-number-prefixed unary)
            if (char === '+' || char === '-') {
                if (isUnary) {
                    // Unary operator token
                    tokens.push({ type: 'operator', symbol: 'U_' + symbol });
                }
                else {
                    // Binary operator token
                    tokens.push({ type: 'operator', symbol: char });
                }
            }
            else {
                // Standard binary operators (*, /, etc.)
                tokens.push({ type: 'operator', symbol: char });
            }
            i++;
            continue;
        }
        throw new Error(`Unknown character found: ${char}`);
    }
    return tokens;
}
/**
 * Operator Precedence Helper
 */
function getPrecedence(op) {
    switch (op) {
        case 'U_+':
        case 'U_-':
            return Precedence.UNARY;
        case '*':
        case '/':
            return Precedence.MULT_DIV;
        case '+':
        case '-':
            return Precedence.ADD_SUB;
        default:
            return Precedence.NONE;
    }
}
/**
 * Shunting-Yard Algorithm: Converts tokens from infix notation to Reverse Polish Notation (RPN).
 * @param tokens The array of tokens.
 * @returns An array of tokens in RPN order.
 */
function shuntingYard(tokens) {
    const outputQueue = [];
    const operatorStack = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            outputQueue.push(token);
        }
        else if (token.type === 'parenthesis') {
            if (token.symbol === '(') {
                operatorStack.push(token);
            }
            else { // token.symbol === ')'
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'parenthesis') {
                    outputQueue.push(operatorStack.pop());
                }
                if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1].symbol !== '(') {
                    throw new Error("Mismatched parentheses.");
                }
                operatorStack.pop(); // Discard '('
            }
        }
        else if (token.type === 'operator') {
            const op1 = token.symbol;
            const p1 = getPrecedence(op1);
            while (operatorStack.length > 0) {
                const topToken = operatorStack[operatorStack.length - 1];
                if (topToken.type === 'operator') {
                    const op2 = topToken.symbol;
                    const p2 = getPrecedence(op2);
                    // Standard check: if op2 has higher or equal precedence, pop it.
                    // Unary operators are right-associative, but since we handle them explicitly,
                    // standard precedence rules suffice for the combined structure.
                    if (p2 >= p1) {
                        outputQueue.push(operatorStack.pop());
                    }
                    else {
                        break;
                    }
                }
                else if (topToken.type === 'parenthesis' && topToken.symbol === '(') {
                    break; // Stop if we hit an open parenthesis
                }
                else {
                    break;
                }
            }
            operatorStack.push(token);
        }
    }
    // Pop remaining operators from the stack to the output queue
    while (operatorStack.length > 0) {
        const token = operatorStack.pop();
        if (token.type === 'parenthesis') {
            throw new Error("Mismatched parentheses.");
        }
        outputQueue.push(token);
    }
    return outputQueue;
}
/**
 * Evaluator: Processes the RPN tokens using a value stack.
 * @param rpnTokens The array of tokens in Reverse Polish Notation.
 * @returns The final evaluated integer result.
 */
function evaluateRPN(rpnTokens) {
    const valueStack = [];
    for (const token of rpnTokens) {
        if (token.type === 'number') {
            valueStack.push(token.value);
        }
        else if (token.type === 'operator') {
            const op = token.symbol;
            if (op.startsWith('U_')) {
                // Unary operation (e.g., U_- or U_+)
                if (valueStack.length < 1)
                    throw new Error("Syntax Error: Missing operand for unary operator.");
                const operand = valueStack.pop();
                if (op === 'U_-') {
                    valueStack.push(-operand);
                }
                else if (op === 'U_+') {
                    valueStack.push(operand);
                }
            }
            else {
                // Binary operation (+, -, *, /)
                if (valueStack.length < 2)
                    throw new Error(`Syntax Error: Missing operands for binary operator ${op}.`);
                // Operands are popped in reverse order (b then a)
                const right = valueStack.pop();
                const left = valueStack.pop();
                let result;
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
                        // Division truncates toward zero (Math.trunc handles this correctly)
                        if (right === 0)
                            throw new Error("Division by zero.");
                        result = Math.trunc(left / right);
                        break;
                    default:
                        throw new Error(`Unknown operator: ${op}`);
                }
                valueStack.push(result);
            }
        }
    }
    if (valueStack.length !== 1) {
        throw new Error("Malformed expression.");
    }
    return valueStack[0];
}
/**
 * Main execution function.
 */
function main() {
    try {
        // Read all input from stdin
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input) {
            return;
        }
        // 1. Tokenize
        const tokens = tokenize(input);
        // 2. Shunting-Yard (Infix -> RPN)
        const rpnTokens = shuntingYard(tokens);
        // 3. Evaluate RPN
        const result = evaluateRPN(rpnTokens);
        // Output the result
        console.log(result);
    }
    catch (e) {
        // Handle parsing or evaluation errors gracefully, though the prompt implies valid input.
        // For robustness, we print the error, but in a strict contest environment, 
        // we might just fail silently or follow specific error rules.
        // console.error(e.message); 
    }
}
main();
