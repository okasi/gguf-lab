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
function solve() {
    let input;
    try {
        input = fs.readFileSync(0, "utf8");
    }
    catch (e) {
        return;
    }
    if (!input)
        return;
    const tokens = [];
    let idx = 0;
    while (idx < input.length) {
        const char = input[idx];
        if (/\s/.test(char)) {
            idx++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = "";
            while (idx < input.length && /\d/.test(input[idx])) {
                numStr += input[idx];
                idx++;
            }
            tokens.push({ type: 'NUM', value: parseInt(numStr, 10) });
        }
        else {
            tokens.push({ type: char });
            idx++;
        }
    }
    let current = 0;
    function parseExpression() {
        let node = parseTerm();
        while (current < tokens.length && (tokens[current].type === '+' || tokens[current].type === '-')) {
            const op = tokens[current].type;
            current++;
            const right = parseTerm();
            if (op === '+')
                node += right;
            else
                node -= right;
        }
        return node;
    }
    function parseTerm() {
        let node = parseUnary();
        while (current < tokens.length && (tokens[current].type === '*' || tokens[current].type === '/')) {
            const op = tokens[current].type;
            current++;
            const right = parseUnary();
            if (op === '*') {
                node *= right;
            }
            else {
                node = Math.trunc(node / right);
            }
        }
        return node;
    }
    function parseUnary() {
        if (current < tokens.length && tokens[current].type === '+') {
            current++;
            return parseUnary();
        }
        if (current < tokens.length && tokens[current].type === '-') {
            current++;
            return -parseUnary();
        }
        return parsePrimary();
    }
    function parsePrimary() {
        if (current >= tokens.length)
            return 0;
        const token = tokens[current];
        if (token.type === 'NUM') {
            current++;
            return token.value;
        }
        else if (token.type === '(') {
            current++;
            const val = parseExpression();
            if (current < tokens.length && tokens[current].type === ')') {
                current++;
            }
            return val;
        }
        return 0;
    }
    const result = parseExpression();
    process.stdout.write(result.toString() + '\n');
}
solve();
