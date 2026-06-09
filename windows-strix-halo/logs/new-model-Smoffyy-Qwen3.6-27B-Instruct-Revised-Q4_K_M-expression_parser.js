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
const input = fs.readFileSync(0, 'utf8').trim();
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    const len = expr.length;
    while (i < len) {
        const ch = expr[i];
        if (ch === ' ') {
            i++;
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < len && expr[i] >= '0' && expr[i] <= '9') {
                num += expr[i++];
            }
            tokens.push({ type: 'NUMBER', value: num });
        }
        else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
            tokens.push({ type: 'OP', value: ch });
            i++;
        }
        else if (ch === '(') {
            tokens.push({ type: 'LPAREN', value: '(' });
            i++;
        }
        else if (ch === ')') {
            tokens.push({ type: 'RPAREN', value: ')' });
            i++;
        }
        else {
            i++;
        }
    }
    return tokens;
}
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        return this.tokens[this.pos++];
    }
    parse() {
        return this.parseExpr();
    }
    parseExpr() {
        let left = this.parseTerm();
        while (this.peek()?.type === 'OP' && (this.peek().value === '+' || this.peek().value === '-')) {
            const op = this.consume().value;
            const right = this.parseTerm();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    }
    parseTerm() {
        let left = this.parseFactor();
        while (this.peek()?.type === 'OP' && (this.peek().value === '*' || this.peek().value === '/')) {
            const op = this.consume().value;
            const right = this.parseFactor();
            left = op === '*' ? left * right : Math.trunc(left / right);
        }
        return left;
    }
    parseFactor() {
        const token = this.peek();
        if (token?.type === 'OP' && (token.value === '+' || token.value === '-')) {
            this.consume();
            const value = this.parseFactor();
            return token.value === '+' ? value : -value;
        }
        if (token?.type === 'LPAREN') {
            this.consume();
            const value = this.parseExpr();
            if (this.peek()?.type === 'RPAREN') {
                this.consume();
            }
            return value;
        }
        if (token?.type === 'NUMBER') {
            this.consume();
            return parseInt(token.value, 10);
        }
        return 0;
    }
}
const tokens = tokenize(input);
const parser = new Parser(tokens);
console.log(parser.parse());
