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
let idx = 0;
const len = input.length;
function skipSpaces() {
    while (idx < len && input[idx] === ' ')
        idx++;
}
function parseNumber() {
    skipSpaces();
    let start = idx;
    while (idx < len && /[0-9]/.test(input[idx]))
        idx++;
    const numStr = input.slice(start, idx);
    return Number(numStr);
}
function parsePrimary() {
    skipSpaces();
    if (input[idx] === '(') {
        idx++; // consume '('
        const val = parseExpression();
        skipSpaces();
        if (input[idx] === ')')
            idx++; // consume ')'
        return val;
    }
    else {
        return parseNumber();
    }
}
function parseUnary() {
    skipSpaces();
    let sign = 1;
    while (input[idx] === '+' || input[idx] === '-') {
        if (input[idx] === '-')
            sign *= -1;
        idx++;
        skipSpaces();
    }
    const val = parsePrimary();
    return sign * val;
}
function parseFactor() {
    return parseUnary();
}
function parseTerm() {
    let val = parseFactor();
    while (true) {
        skipSpaces();
        if (input[idx] === '*') {
            idx++;
            const right = parseFactor();
            val = val * right;
        }
        else if (input[idx] === '/') {
            idx++;
            const right = parseFactor();
            val = Math.trunc(val / right);
        }
        else {
            break;
        }
    }
    return val;
}
function parseExpression() {
    let val = parseTerm();
    while (true) {
        skipSpaces();
        if (input[idx] === '+') {
            idx++;
            const right = parseTerm();
            val = val + right;
        }
        else if (input[idx] === '-') {
            idx++;
            const right = parseTerm();
            val = val - right;
        }
        else {
            break;
        }
    }
    return val;
}
const result = parseExpression();
console.log(result.toString());
