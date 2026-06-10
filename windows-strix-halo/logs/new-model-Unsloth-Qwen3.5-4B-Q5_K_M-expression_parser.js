"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function evaluateExpression(expression) {
    if (!expression.trim())
        return 0;
    const tokens = tokenize(expression);
    let pos = 0;
    while (pos < tokens.length) {
        if (tokens[pos] === "(") {
            pos++;
            const result = evaluateExpression(tokens.slice(pos).join(" "));
            pos += result.toString().length + 1;
        }
        else if (tokens[pos] === ")") {
            pos++;
            return result;
        }
        else if (tokens[pos] === "+" || tokens[pos] === "-") {
            const op = tokens[pos];
            pos++;
            const val = parseFloat(tokens[pos]);
            pos += val.toString().length + 1;
            if (tokens[pos] === "+" || tokens[pos] === "-") {
                const nextOp = tokens[pos];
                pos++;
                const nextVal = parseFloat(tokens[pos]);
                pos += nextVal.toString().length + 1;
                const sum = op === "+" ? val + nextVal : val - nextVal;
                return sum;
            }
            else {
                return val;
            }
        }
        else if (tokens[pos] === "*" || tokens[pos] === "/") {
            const op = tokens[pos];
            pos++;
            const val = parseFloat(tokens[pos]);
            pos += val.toString().length + 1;
            const result = op === "*" ? val * parseFloat(tokens[pos]) : Math.trunc(val / parseFloat(tokens[pos]));
            pos += result.toString().length + 1;
            return result;
        }
        else {
            const val = parseFloat(tokens[pos]);
            pos += val.toString().length + 1;
            return val;
        }
    }
    return 0;
}
function tokenize(expression) {
    const tokens = [];
    let i = 0;
    while (i < expression.length) {
        const char = expression[i];
        if (char === " " || char === "(" || char === ")" || char === "+" || char === "-" || char === "*" || char === "/") {
            tokens.push(char);
            i++;
        }
        else if (char === "(" || char === ")") {
            tokens.push(char);
            i++;
        }
        else {
            let num = "";
            while (i < expression.length && /[0-9]/.test(expression[i])) {
                num += expression[i];
                i++;
            }
            tokens.push(num);
        }
    }
    return tokens;
}
const input = fs_1.default.readFileSync(0, "utf8");
console.log(evaluateExpression(input));
