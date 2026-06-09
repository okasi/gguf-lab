import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();
let pos = 0;
const len = input.length;

function skipSpaces() {
    while (pos < len && input[pos] === " ") pos++;
}

function parseExpr(): number {
    let left = parseTerm();
    while (true) {
        skipSpaces();
        if (pos < len && input[pos] === "+") {
            pos++;
            left += parseTerm();
        } else if (pos < len && input[pos] === "-") {
            pos++;
            left -= parseTerm();
        } else {
            break;
        }
    }
    return left;
}

function parseTerm(): number {
    let left = parseUnary();
    while (true) {
        skipSpaces();
        if (pos < len && input[pos] === "*") {
            pos++;
            left *= parseUnary();
        } else if (pos < len && input[pos] === "/") {
            pos++;
            left = Math.trunc(left / parseUnary());
        } else {
            break;
        }
    }
    return left;
}

function parseUnary(): number {
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

function parsePrimary(): number {
    skipSpaces();
    if (pos < len && input[pos] === "(") {
        pos++;
        const val = parseExpr();
        skipSpaces();
        if (pos < len && input[pos] === ")") pos++;
        return val;
    }
    let start = pos;
    while (pos < len && input[pos] >= "0" && input[pos] <= "9") pos++;
    if (start === pos) throw new Error("Invalid expression");
    return Number(input.slice(start, pos));
}

console.log(parseExpr());
