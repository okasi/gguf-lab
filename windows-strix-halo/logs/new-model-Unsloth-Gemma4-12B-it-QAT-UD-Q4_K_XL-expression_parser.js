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
 * A simple recursive descent parser for arithmetic expressions.
 * Handles:
 * - Addition (+), Subtraction (-)
 * - Multiplication (*), Division (/)
 * - Unary plus (+), Unary minus (-)
 * - Parentheses ()
 * - Integer literals
 * - Truncated division towards zero.
 */
class Evaluator {
    constructor(input) {
        this.pos = 0;
        // Tokenize the input: matches integers, operators, and parentheses
        this.tokens = input.match(/\d+|[+\-*/()]/g) || [];
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        return this.tokens[this.pos++];
    }
    evaluate() {
        const result = this.parseExpression();
        return result;
    }
    // Grammar:
    // Expression -> Term { (+|-) Term }
    // Term       -> Factor { (*|/) Factor }
    // Factor     -> (+|-) Factor | (Expression) | Number
    parseExpression() {
        let left = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.parseTerm();
            if (op === '+')
                left += right;
            else
                left -= right;
        }
        return left;
    }
    parseTerm() {
        let left = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseFactor();
            if (op === '*') {
                left *= right;
            }
            else {
                // Truncate toward zero division
                left = Math.trunc(left / right);
            }
        }
        return left;
    }
    parseFactor() {
        const token = this.peek();
        if (token === '+') {
            this.consume();
            return this.parseFactor();
        }
        if (token === '-') {
            this.consume();
            return -this.parseFactor();
        }
        if (token === '(') {
            this.consume(); // consume (
            const result = this.parseExpression();
            this.consume(); // consume )
            return result;
        }
        const val = parseInt(this.consume(), 10);
        return val;
    }
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8").trim();
        if (!input)
            return;
        const evaluator = new Evaluator(input);
        console.log(evaluator.evaluate());
    }
    catch (e) {
        // Silent error handling for malformed input
    }
}
main();
