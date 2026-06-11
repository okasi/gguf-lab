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
function evaluateExpression(expression) {
    const chars = expression.replace(/\s+/g, "").split("");
    let pos = 0;
    function peek() {
        return chars[pos];
    }
    function consume() {
        return chars[pos++];
    }
    function parseUnary() {
        if (peek() === "+") {
            consume();
            return parseUnary();
        }
        if (peek() === "-") {
            consume();
            return -parseUnary();
        }
        return parseFactor();
    }
    function parseFactor() {
        if (peek() === "(") {
            consume(); // consume '('
            const result = parseExpression();
            consume(); // consume ')'
            return result;
        }
        // Parse integer
        let numStr = "";
        while (pos < chars.length && /\d/.test(chars[pos])) {
            numStr += consume();
        }
        return parseInt(numStr, 10);
    }
    function parseTerm() {
        let left = parseUnary();
        while (peek() === "*" || peek() === "/") {
            const op = consume();
            const right = parseUnary();
            if (op === "*") {
                left = left * right;
            }
            else {
                // Division truncates toward zero
                left = Math.trunc(left / right);
            }
        }
        return left;
    }
    function parseExpression() {
        let left = parseTerm();
        while (peek() === "+" || peek() === "-") {
            const op = consume();
            const right = parseTerm();
            if (op === "+") {
                left = left + right;
            }
            else {
                left = left - right;
            }
        }
        return left;
    }
    return parseExpression();
}
const input = fs.readFileSync(0, "utf8");
const expression = input.trim();
console.log(evaluateExpression(expression));
