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
        this.pos = 0;
        this.tokens = this.tokenize(input);
    }
    tokenize(input) {
        const tokens = [];
        let i = 0;
        while (i < input.length) {
            const char = input[i];
            if (/\s/.test(char)) {
                i++;
            }
            else if (/\d/.test(char)) {
                let num = "";
                while (i < input.length && /\d/.test(input[i])) {
                    num += input[i++];
                }
                tokens.push(num);
            }
            else if ("+-*/()".includes(char)) {
                tokens.push(char);
                i++;
            }
            else {
                i++;
            }
        }
        return tokens;
    }
    peek() {
        return this.tokens[this.pos] || null;
    }
    consume() {
        return this.tokens[this.pos++];
    }
    parse() {
        return this.expression();
    }
    expression() {
        let node = this.term();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.term();
            if (op === '+')
                node += right;
            else
                node -= right;
        }
        return node;
    }
    term() {
        let node = this.unary();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.unary();
            if (op === '*') {
                node *= right;
            }
            else {
                const res = node / right;
                node = res < 0 ? Math.ceil(res) : Math.floor(res);
            }
        }
        return node;
    }
    unary() {
        if (this.peek() === '+') {
            this.consume();
            return this.unary();
        }
        if (this.peek() === '-') {
            this.consume();
            return -this.unary();
        }
        return this.primary();
    }
    primary() {
        const token = this.consume();
        if (token === '(') {
            const result = this.expression();
            this.consume(); // consume ')'
            return result;
        }
        return parseInt(token, 10);
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const parser = new Parser(input);
    process.stdout.write(parser.parse().toString() + "\n");
}
main();
