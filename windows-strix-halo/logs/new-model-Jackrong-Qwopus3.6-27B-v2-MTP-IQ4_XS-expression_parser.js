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
class Parser {
    constructor(input) {
        this.tokens = [];
        this.pos = 0;
        this.tokenize(input);
    }
    tokenize(input) {
        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            if (ch === ' ')
                continue;
            if (ch >= '0' && ch <= '9') {
                let num = '';
                while (i < input.length && input[i] >= '0' && input[i] <= '9') {
                    num += input[i];
                    i++;
                }
                this.tokens.push(num);
                i--; // will be incremented by the for loop
            }
            else {
                this.tokens.push(ch);
            }
        }
    }
    peek() {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : undefined;
    }
    consume() {
        return this.tokens[this.pos++];
    }
    parseExpr() {
        let result = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const rhs = this.parseTerm();
            if (op === '+') {
                result += rhs;
            }
            else {
                result -= rhs;
            }
        }
        return result;
    }
    parseTerm() {
        let result = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const rhs = this.parseFactor();
            if (op === '*') {
                result *= rhs;
            }
            else {
                // Division truncates toward zero
                result = Math.trunc(result / rhs);
            }
        }
        return result;
    }
    parseFactor() {
        if (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const val = this.parseFactor();
            if (op === '+') {
                return val;
            }
            else {
                return -val;
            }
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        const tok = this.peek();
        if (tok === '(') {
            this.consume(); // consume '('
            const result = this.parseExpr();
            this.consume(); // consume ')'
            return result;
        }
        // It must be a number
        const num = this.consume();
        return parseInt(num, 10);
    }
    evaluate() {
        return this.parseExpr();
    }
}
const input = fs.readFileSync(0, 'utf8').trim();
const parser = new Parser(input);
console.log(parser.evaluate());
