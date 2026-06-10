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
// Tokenizer
function tokenize(input) {
    const tokens = [];
    let i = 0;
    const chars = input.replace(/\s/g, ''); // Remove all spaces initially for simpler logic
    while (i < chars.length) {
        const char = chars[i];
        if (char >= '0' && char <= '9' || char === '.') {
            let numStr = '';
            while (i < chars.length && (chars[i] >= '0' && chars[i] <= '9' || chars[i] === '.')) {
                numStr += chars[i];
                i++;
            }
            // Since the problem statement implies integers, we handle potential floats defensively,
            // but the requirement says "integers", so we parse as integer.
            tokens.push({ type: 'NUMBER', value: parseInt(numStr) });
            continue;
        }
        else if (char === '(') {
            tokens.push({ type: 'LPAREN' });
        }
        else if (char === ')') {
            tokens.push({ type: 'RPAREN' });
        }
        else if (char === '+' || char === '-') {
            // Determine if it's unary or binary
            // A '+' or '-' is unary if it's the first token, or if it follows '(', or if it follows another operator
            const isStart = i === 0;
            let previousTokenType = i > 0 ? tokens[tokens.length - 1].type : null;
            const isUnary = isStart || previousTokenType === 'LPAREN' ||
                previousTokenType === 'OPERATOR_PLUS' || previousTokenType === 'OPERATOR_MINUS' ||
                previousTokenType === 'OPERATOR_MULTIPLY' || previousTokenType === 'OPERATOR_DIVIDE';
            if (isUnary) {
                if (char === '+') {
                    tokens.push({ type: 'UNARY_PLUS' });
                }
                else {
                    tokens.push({ type: 'UNARY_MINUS' });
                }
            }
            else {
                if (char === '+') {
                    tokens.push({ type: 'OPERATOR_PLUS' });
                }
                else {
                    tokens.push({ type: 'OPERATOR_MINUS' });
                }
            }
        }
        else if (char === '*') {
            tokens.push({ type: 'OPERATOR_MULTIPLY' });
        }
        else if (char === '/') {
            tokens.push({ type: 'OPERATOR_DIVIDE' });
        }
        else {
            // Should not happen based on problem description
            throw new Error(`Unknown character: ${char}`);
        }
        i++;
    }
    return tokens;
}
// Shunting-Yard implementation adapted for direct evaluation (RPN style)
// Since we are aiming for direct evaluation, we will use two stacks: values and operators.
// This is effectively the standard algorithm for infix evaluation.
// Operator precedence
const precedence = (token) => {
    if (!token)
        return 0;
    switch (token.type) {
        case 'OPERATOR_PLUS':
        case 'OPERATOR_MINUS':
            return 1;
        case 'OPERATOR_MULTIPLY':
        case 'OPERATOR_DIVIDE':
            return 2;
        default:
            return 0;
    }
};
// Apply an operator to the top two values
function applyOp(op, values) {
    const b = values.pop();
    const a = values.pop();
    switch (op.type) {
        case 'OPERATOR_PLUS':
            return a + b;
        case 'OPERATOR_MINUS':
            return a - b;
        case 'OPERATOR_MULTIPLY':
            return a * b;
        case 'OPERATOR_DIVIDE':
            // Truncates toward zero (integer division)
            return Math.trunc(a / b);
        case 'UNARY_PLUS':
            // Unary plus is identity
            return a;
        case 'UNARY_MINUS':
            // Unary minus: negate the first operand
            return -a;
        default:
            throw new Error(`Unknown operator encountered: ${op.type}`);
    }
}
function evaluateExpression(tokens) {
    const values = [];
    const ops = [];
    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            values.push(token.value);
        }
        else if (token.type === 'LPAREN') {
            ops.push(token);
        }
        else if (token.type === 'RPAREN') {
            while (ops.length > 0 && ops[ops.length - 1].type !== 'LPAREN') {
                const op = ops.pop();
                values.push(applyOp(op, values));
            }
            if (ops.length === 0 || ops[ops.length - 1].type !== 'LPAREN') {
                throw new Error("Mismatched parentheses: Missing '('");
            }
            ops.pop(); // Pop the '('
        }
        else if (token.type.startsWith('OPERATOR') || token.type.startsWith('UNARY')) {
            const currentPrecedence = precedence(token);
            // While there is an operator on top of the stack with greater or equal precedence
            // (Note: Unary operators are handled implicitly by the tokenization/application logic,
            // but here we treat them like operators for precedence comparison against binary ones).
            while (ops.length > 0) {
                const topOp = ops[ops.length - 1];
                // Special handling for unary operators: they are effectively higher precedence than binary operators,
                // but in the standard infix stack algorithm, we process them when their scope ends or when the incoming
                // operator has lower precedence. For simplicity, we let the tokenizer handle the distinction,
                // and treat unary as having high precedence relative to binary ones.
                if (precedence(topOp) >= currentPrecedence && topOp.type !== 'LPAREN') {
                    const op = ops.pop();
                    values.push(applyOp(op, values));
                }
                else {
                    break;
                }
            }
            ops.push(token);
        }
    }
    // Empty the operator stack
    while (ops.length > 0) {
        const op = ops.pop();
        if (op.type === 'LPAREN') {
            throw new Error("Mismatched parentheses: Extra '('");
        }
        values.push(applyOp(op, values));
    }
    if (values.length !== 1) {
        throw new Error("Invalid expression format.");
    }
    return values[0];
}
// Main execution
try {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) {
        // Handle empty input case if necessary, though problem implies valid input
        return;
    }
    const tokens = tokenize(input);
    const result = evaluateExpression(tokens);
    console.log(result);
}
catch (e) {
    // In a real environment, we might log the error, but for strict output, we adhere to success path.
    // console.error(e);
}
