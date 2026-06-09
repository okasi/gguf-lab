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
 * Tokenizes the expression string.
 * Handles numbers, operators, parentheses, and whitespace.
 */
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        let char = input[i];
        const isSpace = /\s/.test(char);
        if (isSpace) {
            i++;
            continue;
        }
        // Numbers
        if (/\d/.test(char)) {
            let numStr = '';
            while (i < input.length && /\d/.test(input[i]))
                ;
            {
                numStr += input[i];
                i++;
            }
            const number = Number(numStr);
            tokens.push({ type: 'NUMBER', value: number });
            continue;
        }
        // Unary/Binary operators
        if (/[+\-*/]/.test(char)) {
            // Check if + or - is unary (at start, after open paren, or after another operator)
            const isUnary = tokens.length === 0 ||
                tokens[tokens.length - 1].type === 'OPERATOR' ||
                tokens.length > 0 && tokens[tokens.length - 1].type === 'PAREN' && tokens[tokens.length - 1].value === '(';
            const op = char;
            const operator = op === '+' ? 'U+' : op === '-' ? 'U-' : op;
            // Special case: unary operators are always pushed as a distinct token
            if (isUnary) {
                tokens.push({ type: 'UNARY', value: operator });
                i++;
                continue;
            }
            // Binary operators
            tokens.push({ type: 'OPERATOR', value: op });
            i++;
            continue;
        }
        // Parentheses
        if (char === '(' || char === ')') {
            tokens.push({ type: 'PAREN', value: char });
            i++;
            continue;
        }
        // Unknown character
        tokens.push({ type: 'ERROR', message: `Unknown character: ${char}` });
        i++;
    }
    tokens.push({ type: 'EOF' });
    return tokens;
}
/**
 * Determines the precedence of an operator. Higher numbers bind tighter.
 * Unary takes precedence over binary.
 */
function getPrecedence(token) {
    if (token.type === 'UNARY')
        return 6;
    if (token.type === 'OPERATOR') {
        return {
            '*': 5,
            '/': 5,
            '+': 2,
            '-': 2,
        }[token.value] ?? 0;
    }
    return 0; // Not an operator
}
/**
 * Performs arithmetic operation.
 * Handles integer division truncating toward zero.
 */
function applyOperator(op, left, right) {
    switch (op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/':
            // Integer division truncates toward zero (standard JS behavior for / is floor towards -Infinity, we need C-style truncation towards zero)
            return Math.trunc(left / right);
        case 'U+': return +left + right;
        case 'U-': return left - right;
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}
/**
 * Pops the top operator and applies it to the top two operands.
 * Returns the result.
 */
function applyOp(opStack, opPrecedence) {
    const right = opStack.pop();
    const left = opStack.pop();
    if (opStack.length === 0) {
        throw new Error('Operator stack underflow: missing operand');
    }
    return applyOperator(opStack.pop(), left, right);
}
/**
 * Parses and evaluates the expression using two stacks:
 * one for operands (numbers), one for operators.
 * Uses precedence climbing (shunting yard logic adapted for direct evaluation).
 */
function evaluate(tokens) {
    const opStack = [];
    const valueStack = [];
    for (const token of tokens) {
        switch (token.type) {
            case 'NUMBER':
                valueStack.push(token.value);
                break;
            case 'UNARY':
                // Unary operators always take precedence and are pushed immediately
                opStack.push(token.value);
                break;
            case 'PAREN':
                if (token.value === '(') {
                    opStack.push('(');
                }
                else {
                    // Right parenthesis: evaluate until matching left parenthesis
                    while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
                        let precedence = getPrecedence(opStack.pop());
                        if (typeof precedence === 'number') {
                            valueStack.push(applyOperator(opStack[opStack.length - 1], valueStack.pop(), valueStack.pop()));
                        }
                        else {
                            throw new Error(`Unknown token: ${opStack.pop()?.value}`);
                        }
                    }
                    const open = opStack.pop();
                    if (!open || open !== '(') {
                        throw new Error('Mismatched parenthesis: missing opening parenthesis');
                    }
                    // If the top is an unary operator, apply it now
                    const unary = opStack[opStack.length - 1];
                    if (unary.startsWith('U')) {
                        valueStack.push(applyOperator(unary, valueStack.pop()));
                        opStack.pop();
                    }
                    else {
                        // Operator after opening parenthesis, apply it
                        let precedence = getPrecedence(opStack.pop());
                        if (typeof precedence === 'number') {
                            valueStack.push(applyOperator(opStack.pop(), valueStack.pop(), valueStack.pop()));
                        }
                        else {
                            throw new Error(`Unknown token: ${opStack.pop()?.value}`);
                        }
                    }
                }
                break;
            case 'EOF':
                break;
            case 'ERROR':
                throw new Error(`Tokenization error: ${token.message}`);
        }
    }
    // After parsing, apply remaining operators
    while (opStack.length > 0) {
        let precedence = getPrecedence(opStack.pop());
        if (typeof precedence === 'number') {
            valueStack.push(applyOperator(opStack.pop(), valueStack.pop(), valueStack.pop()));
        }
        else {
            throw new Error(`Unknown token in operator stack: ${opStack.pop()?.value}`);
        }
    }
    const result = valueStack.pop();
    if (typeof result !== 'number') {
        throw new Error('Expression evaluation failed: empty value stack');
    }
    return result;
}
// --- Main execution ---
try {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) {
        process.stdout.write('\n');
        process.exit(0);
    }
    const tokens = tokenize(input);
    const result = evaluate(tokens);
    process.stdout.write(String(result) + '\n');
}
catch (e) {
    console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
}
