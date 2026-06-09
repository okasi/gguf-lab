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
const input = fs.readFileSync(0, "utf8").trim();
let pos = 0;
const len = input.length;
function skipSpaces() {
    while (pos < len && input[pos] === " ")
        pos++;
}
function parseExpr() {
    let left = parseTerm();
    while (true) {
        skipSpaces();
        if (pos < len && input[pos] === "+") {
            pos++;
            left += parseTerm();
        }
        else if (pos < len && input[pos] === "-") {
            pos++;
            left -= parseTerm();
        }
        else {
            break;
        }
    }
    return left;
}
function parseTerm() {
    let left = parseUnary();
    while (true) {
        skipSpaces();
        if (pos < len && input[pos] === "*") {
            pos++;
            left *= parseUnary();
        }
        else if (pos < len && input[pos] === "/") {
            pos++;
            left = Math.trunc(left / parseUnary());
        }
        else {
            break;
        }
    }
    return left;
}
function parseUnary() {
    skipSpaces();
    if (pos < len && input[pos] === "-") {
        pos++;
        return -parseUnary();
    }
    if (pos < len && input[pos] === "+") {
        pos++;
        return parseUnary();
    }
    return parsePrimary();
}
function parsePrimary() {
    skipSpaces();
    if (pos < len && input[pos] === "(") {
        pos++;
        const val = parseExpr();
        skipSpaces();
        if (pos < len && input[pos] === ")")
            pos++;
        return val;
    }
    let start = pos;
    while (pos < len && input[pos] >= "0" && input[pos] <= "9")
        pos++;
    if (start === pos)
        throw new Error("Invalid expression");
    return Number(input.slice(start, pos));
}
console.log(parseExpr());
