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
function tokenize(input) {
    const tokens = [];
    let i = 0;
    let canBeUnary = true;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/[0-9]/.test(char)) {
            let numStr = "";
            while (i < input.length && /[0-9]/.test(input[i])) {
                numStr += input[i];
                i++;
            }
            tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10), precedence: 0 });
            canBeUnary = false;
            continue;
        }
        if (char === '+') {
            tokens.push({
                type: 'OPERATOR',
                value: '+',
                precedence: canBeUnary ? 3 : 1,
                unary: canBeUnary,
                rightAssociative: canBeUnary
            });
            canBeUnary = true;
            i++;
        }
        else if (char === '-') {
            tokens.push({
                type: 'OPERATOR',
                value: '-',
                precedence: canBeUnary ? 3 : 1,
                unary: canBeUnary,
                rightAssociative: canBeUnary
            });
            canBeUnary = true;
            i++;
        }
        else if (char === '*') {
            tokens.push({ type: 'OPERATOR', value: '*', precedence: 2 });
            canBeUnary = false;
            i++;
        }
        else if (char === '/') {
            tokens.push({ type: 'OPERATOR', value: '/', precedence: 2 });
            canBeUnary = false;
            i++;
        }
        else if (char === '(') {
            tokens.push({ type: 'LPAREN', value: '(', precedence: 0 });
            canBeUnary = true;
            i++;
        }
        else if (char === ')') {
            tokens.push({ type: 'RPAREN', value: ')', precedence: 0 });
            canBeUnary = false;
            i++;
        }
        else {
            i++;
        }
    }
    return tokens;
}
function evaluate(tokens) {
    const values = [];
    const operators = [];
    const applyOperator = () => {
        if (operators.length === 0)
            return;
        const op = operators.pop();
        if (op.unary) {
            if (values.length < 1)
                return;
            const val = values.pop();
            if (op.value === '+')
                values.push(val);
            else if (op.value === '-')
                values.push(-val);
        }
        else {
            if (values.length < 2)
                return;
            const right = values.pop();
            const left = values.pop();
            if (op.value === '+')
                values.push(left + right);
            else if (op.value === '-')
                values.push(left - right);
            else if (op.value === '*')
                values.push(left * right);
            else if (op.value === '/') {
                if (right === 0) {
                    values.push(0);
                }
                else {
                    values.push(Math.trunc(left / right));
                }
            }
        }
    };
    for (const token of tokens) {
        if (token.type === 'NUMBER') {
            values.push(token.value);
        }
        else if (token.type === 'LPAREN') {
            operators.push(token);
        }
        else if (token.type === 'RPAREN') {
            while (operators.length && operators[operators.length - 1].type !== 'LPAREN') {
                applyOperator();
            }
            operators.pop();
        }
        else if (token.type === 'OPERATOR') {
            while (operators.length &&
                operators[operators.length - 1].type !== 'LPAREN' &&
                (operators[operators.length - 1].precedence > token.precedence ||
                    (operators[operators.length - 1].precedence === token.precedence && !token.rightAssociative))) {
                applyOperator();
            }
            operators.push(token);
        }
    }
    while (operators.length) {
        applyOperator();
    }
    return values[0];
}
const input = fs.readFileSync(0, "utf8");
if (input.trim()) {
    console.log(evaluate(tokenize(input)).toString());
}
