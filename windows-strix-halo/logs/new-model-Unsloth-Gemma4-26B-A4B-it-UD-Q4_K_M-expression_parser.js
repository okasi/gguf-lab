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
    constructor(tokens) {
        this.pos = 0;
        this.tokens = tokens;
    }
    peek() {
        return this.tokens[this.pos];
    }
    consume() {
        return this.tokens[this.pos++];
    }
    parseExpression() {
        let node = this.parseTerm();
        while (this.peek() === "+" || this.peek() === "-") {
            const op = this.consume();
            const right = this.parseTerm();
            if (op === "+") {
                node += right;
            }
            else {
                node -= right;
            }
        }
        return node;
    }
    parseTerm() {
        let node = this.parseFactor();
        while (this.peek() === "*" || this.peek() === "/") {
            const op = this.consume();
            const right = this.parseFactor();
            if (op === "*") {
                node *= right;
            }
            else {
                node = Math.trunc(node / right);
            }
        }
        return node;
    }
    parseFactor() {
        const token = this.peek();
        if (token === "+") {
            this.consume();
            return this.parseFactor();
        }
        else if (token === "-") {
            this.consume();
            return -this.parseFactor();
        }
        else {
            return this.parsePrimary();
        }
    }
    parsePrimary() {
        const token = this.consume();
        if (token === "(") {
            const val = this.parseExpression();
            this.consume(); // consume ')'
            return val;
        }
        else {
            return parseInt(token, 10);
        }
    }
}
function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        if (/\d/.test(char)) {
            let num = "";
            while (i < input.length && /\d/.test(input[i])) {
                num += input[i];
                i++;
            }
            tokens.push(num);
            continue;
        }
        if ("+-*/()".includes(char)) {
            tokens.push(char);
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        if (!input || !input.trim())
            return;
        const tokens = tokenize(input);
        if (tokens.length === 0)
            return;
        const parser = new Parser(tokens);
        const result = parser.parseExpression();
        process.stdout.write(result.toString() + "\n");
    }
    catch (e) {
        // Handle errors silently
    }
}
main();
