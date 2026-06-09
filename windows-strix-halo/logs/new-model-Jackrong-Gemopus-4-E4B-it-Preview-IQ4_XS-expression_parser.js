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
 * Determines the precedence of an operator.
 * @param op The operator
 * @returns A number representing precedence (lower is weaker)
 */
function getPrecedence(op) {
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
function applyOperator(left, right, op) {
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
function tokenize(input) {
    const tokens = [];
    // Regex to match numbers (including optional leading sign), operators, and parentheses
    const tokenRegex = /[-+]?\d+|[+\-*/()]|/g;
    const matches = input.match(tokenRegex);
    if (!matches) {
        throw new Error("No tokens found in input");
    }
    return matches.map(t => {
        if (/^[-+]?\d+$/.test(t))
            ;
    });
    {
        return Number(t);
    }
    return t;
}
;
/**
 * Converts infix tokens to postfix (RPN) using the Shunting-Yard algorithm.
 * @param tokens The array of tokens
 * @returns The array of postfix operators and operands
 */
function toPostfix(tokens) {
    const output = [];
    const operators = [];
    for (const token of tokens) {
        if (typeof token === 'number') {
            output.push(token);
        }
        else if (token === '(') {
            operators.push(token);
        }
        else if (token === ')') {
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                output.push(operators.pop());
            }
            if (operators.length === 0 || operators[operators.length - 1] !== '(') {
                throw new Error("Mismatched parentheses");
            }
            operators.pop(); // Pop '('
        }
        else if (token === '+' || token === '-') {
            const currentPrecedence = getPrecedence(token);
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                const top = operators[operators.length - 1];
                if (getPrecedence(operators[operators.length - 1]) >= currentPrecedence) {
                    output.push(operators.pop());
                }
                else {
                    break;
                }
            }
            operators.push(token);
        }
        else {
            throw new Error(`Unknown token: ${token}`);
        }
    }
    while (operators.length > 0) {
        if (operators[operators.length - 1] !== '(') {
            output.push(operators.pop());
        }
        else {
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
function evaluateRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (typeof token === 'number') {
            stack.push(token);
        }
        else if (token === '(') {
            throw new Error("Unexpected open parenthesis in RPN");
        }
        else if (token === ')') {
            const op = operators.pop();
            if (op === '(') {
                throw new Error("Mismatched parentheses");
            }
            const right = stack.pop();
            const left = stack.pop();
            const result = applyOperator(left, right, op);
            stack.push(result);
        }
        else if (token === '+' || token === '-') {
            const currentPrecedence = getPrecedence(token);
            while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                const top = operators[operators.length - 1];
                if (getPrecedence(operators[operators.length - 1]) >= currentPrecedence) {
                    output.push(operators.pop());
                }
                else {
                    break;
                }
            }
            operators.push(token);
        }
        else {
            throw new Error(`Unknown token: ${token}`);
        }
    }
    while (operators.length > 0) {
        if (operators[operators.length - 1] !== '(') {
            output.push(operators.pop());
        }
        else {
            throw new Error("Mismatched parentheses");
        }
    }
    return stack.pop();
}
try {
    const input = fs.readFileSync(0, "utf8");
    const tokens = tokenize(input);
    const postfix = toPostfix(tokens);
    const result = evaluateRPN(postfix);
    console.log(result);
}
catch (e) {
    process.exit(1);
}
