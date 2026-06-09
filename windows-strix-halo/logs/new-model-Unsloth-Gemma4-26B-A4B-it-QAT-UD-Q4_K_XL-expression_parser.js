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
 * Arithmetic Expression Evaluator
 * Implements a Recursive Descent Parser to handle precedence and parentheses.
 */
class Evaluator {
    constructor(input) {
        this.tokens = this.tokenize(input);
        this.pos = 0;
    }
    tokenize(input) {
        const regex = /\d+|[+\-*/()]/g;
        return input.match(regex) || [];
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        return this.tokens[this.pos++];
    }
    evaluate() {
        if (this.tokens.length === 0)
            return 0;
        const result = this.parseExpression();
        return result;
    }
    // Lowest precedence: Addition and Subtraction
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
    // Middle precedence: Multiplication and Division
    parseTerm() {
        let node = this.parseUnary();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseUnary();
            if (op === '*') {
                node *= right;
            }
            else {
                // Truncate toward zero division
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }
    // Highest precedence: Unary +/-
    parseUnary() {
        if (this.peek() === '+') {
            this.consume();
            return this.parseUnary();
        }
        if (this.peek() === '-') {
            this.consume();
            return -this.parseUnary();
        }
        return this.parsePrimary();
    }
    // Base case: Parentheses or Numbers
    parsePrimary() {
        const token = this.consume();
        if (token === '(') {
            const result = this.parseExpression();
            this.consume(); // consume ')'
            return result;
        }
        else {
            return parseInt(token, 10);
        }
    }
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input)
            return;
        const evaluator = new Evaluator(input);
        console.log(evaluator.evaluate());
    }
    catch (e) {
        // Silently handle or exit
        process.exit(0);
    }
}
main();
