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
 * Implementation of a recursive descent parser to evaluate arithmetic expressions.
 * Handles:
 * - Integer literals
 * - Binary operators: +, -, *, / (truncating division)
 * - Unary operators: +, -
 * - Parentheses: ( )
 */
class ExpressionParser {
    constructor(input) {
        this.pos = 0;
        this.tokens = this.tokenize(input);
    }
    tokenize(input) {
        const tokens = [];
        // Match numbers, or single characters for operators and parentheses
        const regex = /\d+|[+\-*/()]/g;
        let match;
        while ((match = regex.exec(input)) !== null) {
            tokens.push(match[0]);
        }
        return tokens;
    }
    peek() {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
    }
    consume() {
        return this.peek() !== null ? this.tokens[this.pos++] : null;
    }
    // Grammar:
    // Expression -> Term (('+' | '-') Term)*
    // Term       -> Factor (('*' | '/') Factor)*
    // Factor     -> ('+' | '-') Factor | Primary
    // Primary    -> Number | '(' Expression ')'
    evaluate() {
        return this.parseExpression();
    }
    parseExpression() {
        let node = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            !;
            const right = this.parseTerm();
            if (op === '+')
                node += right;
            else
                node -= right;
        }
        return node;
    }
    parseTerm() {
        let node = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseFactor();
            if (op === '*') {
                node *= right;
            }
            else {
                // Integer division truncating toward zero
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }
    parseFactor() {
        const token = this.peek();
        if (token === '+') {
            this.consume();
            return this.parseFactor();
        }
        else if (token === '-') {
            this.consume();
            return -this.parseFactor();
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const token = this.consume();
        if (token === '(') {
            const result = this.parseExpression();
            this.consume(); // consume ')'
            return result;
        }
        else if (token === undefined) {
            throw new Error("Unexpected end of input");
        }
        else {
            // It's a number
            return parseInt(token, 10);
        }
    }
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input.trim())
            return;
        const parser = new ExpressionParser(input);
        console.log(parser.evaluate());
    }
    catch (err) {
        process.exit(1);
    }
}
main();
