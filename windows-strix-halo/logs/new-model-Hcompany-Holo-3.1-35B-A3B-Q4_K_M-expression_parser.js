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
const input = fs.readFileSync(0, "utf8").trim();
const operators = {
    '+': { type: '+', precedence: 1 },
    '-': { type: '-', precedence: 1 },
    '*': { type: '*', precedence: 2 },
    '/': { type: '/', precedence: 2 },
    '(': { type: '(', precedence: 0 },
    ')': { type: ')', precedence: 0 }
};
function shuntingYard(expression) {
    const queue = [];
    const stack = [];
    let currentNumber = "";
    let index = 0;
    while (index < expression.length) {
        const char = expression[index];
        if (/\d/.test(char) || char === '.') {
            currentNumber += char;
        }
        else if (char === '+' || char === '-' || char === '*' || char === '/' || char === '(' || char === ')') {
            if (currentNumber.length > 0) {
                queue.push(parseFloat(currentNumber));
                currentNumber = "";
            }
            const op = operators[char];
            if (op.type === '(') {
                stack.push(op);
            }
            else if (op.type === ')') {
                while (stack.length > 0 && stack[stack.length - 1].type !== '(') {
                    queue.push(stack.pop());
                }
                stack.pop();
            }
            else {
                while (stack.length > 0 && stack[stack.length - 1].precedence >= op.precedence) {
                    queue.push(stack.pop());
                }
                stack.push(op);
            }
        }
        index++;
    }
    if (currentNumber.length > 0) {
        queue.push(parseFloat(currentNumber));
    }
    while (stack.length > 0) {
        queue.push(stack.pop());
    }
    return queue;
}
function evaluate(expression) {
    const queue = shuntingYard(expression);
    const stack = [];
    for (const token of queue) {
        if (typeof token === "number") {
            stack.push(token);
        }
        else {
            const right = stack.pop();
            const left = stack.pop();
            switch (token.type) {
                case '+':
                    stack.push(left + right);
                    break;
                case '-':
                    stack.push(left - right);
                    break;
                case '*':
                    stack.push(left * right);
                    break;
                case '/':
                    stack.push(Math.trunc(left / right));
                    break;
            }
        }
    }
    return stack[0];
}
console.log(evaluate(input));
