"use strict";
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = [];
    let i = 0;
    const s = input.replace(/\s+/g, "");
    while (i < s.length) {
        const char = s[i];
        if (/[0-9]/.test(char)) {
            let numStr = "";
            while (i < s.length && /[0-9]/.test(s[i])) {
                numStr += s[i++];
            }
            tokens.push(parseInt(numStr, 10));
            continue;
        }
        if ("+-*/()".includes(char)) {
            tokens.push(char);
            i++;
            continue;
        }
        i++;
    }
    const precedence = {
        "+": 1, "-": 1,
        "*": 2, "/": 2,
        "u+": 3, "u-": 3
    };
    const outputStack = [];
    const opStack = [];
    for (let j = 0; j < tokens.length; j++) {
        const token = tokens[j];
        if (typeof token === "number") {
            outputStack.push(token);
        }
        else if (token === "(") {
            opStack.push("(");
        }
        else if (token === ")") {
            while (opStack.length && opStack[opStack.length - 1] !== "(") {
                applyOp(opStack.pop(), outputStack);
            }
            opStack.pop();
        }
        else {
            let op = token;
            if (j === 0 || (typeof tokens[j - 1] === "string" && tokens[j - 1] === "(")) {
                if (op === "-")
                    op = "u-";
                else if (op === "+")
                    op = "u+";
            }
            while (opStack.length && opStack[opStack.length - 1] !== "(") {
                const top = opStack[opStack.length - 1];
                const topPrec = precedence[top];
                const currPrec = precedence[op];
                if (op.startsWith("u")) {
                    if (topPrec > currPrec)
                        applyOp(opStack.pop(), outputStack);
                    else
                        break;
                }
                else {
                    if (topPrec >= currPrec)
                        applyOp(opStack.pop(), outputStack);
                    else
                        break;
                }
            }
            opStack.push(op);
        }
    }
    while (opStack.length) {
        applyOp(opStack.pop(), outputStack);
    }
    console.log(outputStack[0]);
}
function applyOp(op, stack) {
    if (op === "u-") {
        stack.push(-stack.pop());
    }
    else if (op === "u+") {
        // do nothing
    }
    else {
        const b = stack.pop();
        const a = stack.pop();
        switch (op) {
            case "+":
                stack.push(a + b);
                break;
            case "-":
                stack.push(a - b);
                break;
            case "*":
                stack.push(a * b);
                break;
            case "/":
                stack.push(Math.trunc(a / b));
                break;
        }
    }
}
solve();
