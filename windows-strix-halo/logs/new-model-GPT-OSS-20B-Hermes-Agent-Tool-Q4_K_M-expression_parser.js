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
function evaluateExpression(expr) {
    let index = 0;
    const tokens = tokenize(expr);
    function parseExpression() {
        let value = parseTerm();
        while (true) {
            const token = tokens[index];
            if (token === "+" || token === "-") {
                index++;
                const nextTerm = parseTerm();
                if (token === "+")
                    value += nextTerm;
                else
                    value -= nextTerm;
            }
            else {
                break;
            }
        }
        return value;
    }
    function parseTerm() {
        let value = parseFactor();
        while (true) {
            const token = tokens[index];
            if (token === "*" || token === "/") {
                index++;
                const nextFactor = parseFactor();
                if (token === "*")
                    value *= nextFactor;
                else
                    value = Math.trunc(value / nextFactor);
            }
            else {
                break;
            }
        }
        return value;
    }
    function parseFactor() {
        const token = tokens[index];
        if (token === "+" || token === "-") {
            index++;
            const factor = parseFactor();
            return token === "+" ? factor : -factor;
        }
        else if (token === "(") {
            index++;
            const expr = parseExpression();
            if (tokens[index] !== ")") {
                throw new Error("Expected ')'");
            }
            index++;
            return expr;
        }
        else if (isNumber(token)) {
            index++;
            return Number(token);
        }
        else {
            throw new Error(`Unexpected token: ${token}`);
        }
    }
    function isNumber(token) {
        return /^[0-9]+$/.test(token);
    }
    function tokenize(str) {
        const result = [];
        let i = 0;
        while (i < str.length) {
            const char = str[i];
            if (char === " " || char === "\t" || char === "\n") {
                i++;
            }
            else if (char === "+" || char === "-" || char === "*" || char === "/" || char === "(" || char === ")") {
                result.push(char);
                i++;
            }
            else if (/[0-9]/.test(char)) {
                let num = "";
                while (i < str.length && /[0-9]/.test(str[i])) {
                    num += str[i];
                    i++;
                }
                result.push(num);
            }
            else {
                throw new Error(`Invalid character: ${char}`);
            }
        }
        return result;
    }
    const result = parseExpression();
    if (index < tokens.length) {
        throw new Error("Unexpected tokens at the end");
    }
    return result;
}
const input = fs.readFileSync(0, "utf8").trim();
const output = evaluateExpression(input);
console.log(output);
