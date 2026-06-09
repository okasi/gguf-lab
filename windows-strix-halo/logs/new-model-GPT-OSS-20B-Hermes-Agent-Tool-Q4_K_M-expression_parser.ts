import * as fs from "fs";

function evaluateExpression(expr: string): number {
  let index = 0;
  const tokens = tokenize(expr);

  function parseExpression(): number {
    let value = parseTerm();
    while (true) {
      const token = tokens[index];
      if (token === "+" || token === "-") {
        index++;
        const nextTerm = parseTerm();
        if (token === "+") value += nextTerm;
        else value -= nextTerm;
      } else {
        break;
      }
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseFactor();
    while (true) {
      const token = tokens[index];
      if (token === "*" || token === "/") {
        index++;
        const nextFactor = parseFactor();
        if (token === "*") value *= nextFactor;
        else value = Math.trunc(value / nextFactor);
      } else {
        break;
      }
    }
    return value;
  }

  function parseFactor(): number {
    const token = tokens[index];
    if (token === "+" || token === "-") {
      index++;
      const factor = parseFactor();
      return token === "+" ? factor : -factor;
    } else if (token === "(") {
      index++;
      const expr = parseExpression();
      if (tokens[index] !== ")") {
        throw new Error("Expected ')'");
      }
      index++;
      return expr;
    } else if (isNumber(token)) {
      index++;
      return Number(token);
    } else {
      throw new Error(`Unexpected token: ${token}`);
    }
  }

  function isNumber(token: string): boolean {
    return /^[0-9]+$/.test(token);
  }

  function tokenize(str: string): string[] {
    const result: string[] = [];
    let i = 0;
    while (i < str.length) {
      const char = str[i];
      if (char === " " || char === "\t" || char === "\n") {
        i++;
      } else if (char === "+" || char === "-" || char === "*" || char === "/" || char === "(" || char === ")") {
        result.push(char);
        i++;
      } else if (/[0-9]/.test(char)) {
        let num = "";
        while (i < str.length && /[0-9]/.test(str[i])) {
          num += str[i];
          i++;
        }
        result.push(num);
      } else {
        throw new Error(`Invalid character: ${char}`);
      }
    }
    return result;
  }

  const result = parseExpression();
  if (index < tokens.length) {
    throw new Error("Unexpected tokens at the end");
  }
  return result;
}

const input = fs.readFileSync(0, "utf8").trim();
const output = evaluateExpression(input);
console.log(output);
