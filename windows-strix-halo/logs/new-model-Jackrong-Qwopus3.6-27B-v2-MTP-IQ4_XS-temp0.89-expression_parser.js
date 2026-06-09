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
function isUnaryContext(tokens) {
    if (tokens.length === 0)
        return true;
    const last = tokens[tokens.length - 1];
    return last.type === "LPAREN" || last.type === "OP";
}
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    const len = expr.length;
    while (i < len) {
        if (expr[i] === " ") {
            i++;
            continue;
        }
        if (expr[i] >= "0" && expr[i] <= "9") {
            let start = i;
            while (i < len && expr[i] >= "0" && expr[i] <= "9")
                i++;
            tokens.push({ type: "NUMBER", value: Number(expr.slice(start, i)) });
        }
        else if (expr[i] === "(") {
            tokens.push({ type: "LPAREN", value: "(" });
            i++;
        }
        else if (expr[i] === ")") {
            tokens.push({ type: "RPAREN", value: ")" });
            i++;
        }
        else if (expr[i] === "+" || expr[i] === "-" || expr[i] === "*" || expr[i] === "/") {
            const isUnary = isUnaryContext(tokens);
            let opVal;
            if (isUnary) {
                opVal = expr[i] === "+" ? "u+" : "u-";
            }
            else {
                opVal = expr[i];
            }
            tokens.push({ type: "OP", value: opVal });
            i++;
        }
        else {
            throw new Error(`Unexpected character: ${expr[i]}`);
        }
    }
    return tokens;
}
function toRPN(tokens) {
    const output = [];
    const stack = [];
    const precedence = {
        "u+": 3,
        "u-": 3,
        "*": 2,
        "/": 2,
        "+": 1,
        "-": 1,
    };
    const rightAssociative = (op) => op === "u+" || op === "u-";
    for (const token of tokens) {
        if (token.type === "NUMBER") {
            output.push(token);
        }
        else if (token.type === "OP") {
            const p1 = precedence[token.value];
            while (stack.length > 0 &&
                stack[stack.length - 1].type === "OP" &&
                ((rightAssociative(token.value) &&
                    precedence[stack[stack.length - 1].value] > p1) ||
                    (!rightAssociative(token.value) &&
                        precedence[stack[stack.length - 1].value] >= p1))) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
        else if (token.type === "LPAREN") {
            stack.push(token);
        }
        else if (token.type === "RPAREN") {
            while (stack.length > 0 && stack[stack.length - 1].type !== "LPAREN") {
                output.push(stack.pop());
            }
            if (stack.length > 0)
                stack.pop();
        }
    }
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    return output;
}
function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (token.type === "NUMBER") {
            stack.push(token.value);
        }
        else if (token.type === "OP") {
            const op = token.value;
            if (op === "u+") {
                const a = stack.pop();
                stack.push(a);
            }
            else if (op === "u-") {
                const a = stack.pop();
                stack.push(-a);
            }
            else {
                const b = stack.pop();
                const a = stack.pop();
                switch (op) {
                    case "+":
                        stack.push(a + b);
                        break;
                    case "-":
                        stack.push(a - b);
                        break;
                    case "*":
                        stack.push(a * b);
                        break;
                    case "/":
                        stack.push(Math.trunc(a / b));
                        break;
                }
            }
        }
    }
    return stack[0];
}
const input = fs.readFileSync(0, "utf8").trim();
const tokens = tokenize(input);
const rpn = toRPN(tokens);
const result = evaluateRPN(rpn);
console.log(result);
