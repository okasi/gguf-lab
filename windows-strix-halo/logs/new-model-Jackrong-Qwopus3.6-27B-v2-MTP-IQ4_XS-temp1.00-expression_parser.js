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
function tokenize(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
        if (s[i] === " ") {
            i++;
            continue;
        }
        if (s[i] >= "0" && s[i] <= "9") {
            let j = i;
            while (j < s.length && s[j] >= "0" && s[j] <= "9")
                j++;
            tokens.push({ type: "number", value: s.slice(i, j) });
            i = j;
            continue;
        }
        if ("+-*/".includes(s[i])) {
            tokens.push({ type: "operator", value: s[i] });
            i++;
            continue;
        }
        if (s[i] === "(" || s[i] === ")") {
            tokens.push({ type: "paren", value: s[i] });
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
function precedence(op, isUnary) {
    if (isUnary && (op === "+" || op === "-"))
        return 3;
    if (op === "*" || op === "/")
        return 2;
    if (op === "+" || op === "-")
        return 1;
    return 0;
}
function isRightAssociative(op) {
    return false; // none of our operators are right-associative
}
// Shunting-yard
function toRPN(tokens) {
    const output = [];
    const stack = [];
    for (const token of tokens) {
        if (token.type === "number") {
            output.push(token);
        }
        else if (token.type === "paren" && token.value === "(") {
            stack.push(token);
        }
        else if (token.type === "paren" && token.value === ")") {
            while (stack.length > 0 && stack[stack.length - 1].value !== "(") {
                output.push(stack.pop());
            }
            stack.pop(); // pop '('
        }
        else if (token.type === "operator") {
            // Determine if unary
            const isUnary = (output.length === 0 && stack.length === 0 ||
                (stack.length > 0 && (stack[stack.length - 1].value === "(" ||
                    (stack[stack.length - 1].type === "operator" && stack[stack.length - 1].value !== ")"))) ||
                (output.length > 0 && stack.length > 0 && stack[stack.length - 1].value === "("));
            // Actually, the standard way to check: if the previous token (in the output or stack) was an operator or '(' or it's the first token
            // Let me reconsider. The token before this operator in the sequence determines if it's unary.
            // After tokenizing, we check what came before in the tokens array.
            // Let me redo: track the previous token type
        }
    }
    // Let me reconsider the approach. I'll track whether each operator is unary as I parse.
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    return output;
}
