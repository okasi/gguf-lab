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
let s = input;
let index = 0;
function skipSpaces() {
    while (index < s.length && s[index] === ' ') {
        index++;
    }
}
function parseNumber() {
    skipSpaces();
    let start = index;
    while (index < s.length && s[index] >= '0' && s[index] <= '9') {
        index++;
    }
    return Number(s.slice(start, index));
}
function truncDiv(a, b) {
    return Math.trunc(a / b);
}
function parseFactor() {
    skipSpaces();
    const ch = s[index];
    if (ch === '(') {
        index++; // skip '('
        const val = parseExpression();
        skipSpaces();
        if (s[index] !== ')') {
            throw new Error('Expected )');
        }
        index++; // skip ')'
        return val;
    }
    else if (ch === '+' || ch === '-') {
        index++; // skip unary operator
        const val = parseFactor();
        return ch === '+' ? val : -val;
    }
    else {
        return parseNumber();
    }
}
function parseTerm() {
    let left = parseFactor();
    while (true) {
        skipSpaces();
        if (index < s.length && (s[index] === '*' || s[index] === '/')) {
            const op = s[index];
            index++;
            const right = parseFactor();
            if (op === '*') {
                left *= right;
            }
            else {
                left = truncDiv(left, right);
            }
        }
        else {
            break;
        }
    }
    return left;
}
function parseExpression() {
    let left = parseTerm();
    while (true) {
        skipSpaces();
        if (index < s.length && (s[index] === '+' || s[index] === '-')) {
            const op = s[index];
            index++;
            const right = parseTerm();
            if (op === '+') {
                left += right;
            }
            else {
                left -= right;
            }
        }
        else {
            break;
        }
    }
    return left;
}
const result = parseExpression();
console.log(result.toString());
