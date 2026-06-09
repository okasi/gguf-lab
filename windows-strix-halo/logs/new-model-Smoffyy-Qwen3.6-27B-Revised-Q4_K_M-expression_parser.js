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
let pos = 0;
const len = input.length;
function skipSpaces() {
    while (pos < len && input[pos] === ' ')
        pos++;
}
function parseExpr() {
    skipSpaces();
    let res = parseTerm();
    while (pos < len && (input[pos] === '+' || input[pos] === '-')) {
        const op = input[pos++];
        skipSpaces();
        const right = parseTerm();
        res = op === '+' ? res + right : res - right;
    }
    return res;
}
function parseTerm() {
    skipSpaces();
    let res = parseFactor();
    while (pos < len && (input[pos] === '*' || input[pos] === '/')) {
        const op = input[pos++];
        skipSpaces();
        const right = parseFactor();
        res = op === '*' ? res * right : Math.trunc(res / right);
    }
    return res;
}
function parseFactor() {
    skipSpaces();
    if (pos >= len)
        throw new Error('Unexpected end of input');
    if (input[pos] === '+') {
        pos++;
        return parseFactor();
    }
    if (input[pos] === '-') {
        pos++;
        return -parseFactor();
    }
    if (input[pos] === '(') {
        pos++;
        const res = parseExpr();
        skipSpaces();
        if (pos < len && input[pos] === ')')
            pos++;
        return res;
    }
    let numStr = '';
    while (pos < len && input[pos] >= '0' && input[pos] <= '9') {
        numStr += input[pos++];
    }
    if (numStr === '')
        throw new Error('Expected number');
    return Number(numStr);
}
console.log(parseExpr());
