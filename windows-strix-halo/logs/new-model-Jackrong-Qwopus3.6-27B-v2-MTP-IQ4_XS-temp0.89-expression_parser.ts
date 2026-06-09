import * as fs from "fs";

type TokenType = "NUMBER" | "OP" | "LPAREN" | "RPAREN";

interface Token {
  type: TokenType;
  value: string | number;
}

function isUnaryContext(tokens: Token[]): boolean {
  if (tokens.length === 0) return true;
  const last = tokens[tokens.length - 1];
  return last.type === "LPAREN" || last.type === "OP";
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = expr.length;

  while (i < len) {
    if (expr[i] === " ") {
      i++;
      continue;
    }
    if (expr[i] >= "0" && expr[i] <= "9") {
      let start = i;
      while (i < len && expr[i] >= "0" && expr[i] <= "9") i++;
      tokens.push({ type: "NUMBER", value: Number(expr.slice(start, i)) });
    } else if (expr[i] === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
    } else if (expr[i] === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
    } else if (expr[i] === "+" || expr[i] === "-" || expr[i] === "*" || expr[i] === "/") {
      const isUnary = isUnaryContext(tokens);
      let opVal: string;
      if (isUnary) {
        opVal = expr[i] === "+" ? "u+" : "u-";
      } else {
        opVal = expr[i];
      }
      tokens.push({ type: "OP", value: opVal });
      i++;
    } else {
      throw new Error(`Unexpected character: ${expr[i]}`);
    }
  }

  return tokens;
}

function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  const precedence: Record<string, number> = {
    "u+": 3,
    "u-": 3,
    "*": 2,
    "/": 2,
    "+": 1,
    "-": 1,
  };

  const rightAssociative = (op: string): boolean => op === "u+" || op === "u-";

  for (const token of tokens) {
    if (token.type === "NUMBER") {
      output.push(token);
    } else if (token.type === "OP") {
      const p1 = precedence[token.value as string];
      while (
        stack.length > 0 &&
        stack[stack.length - 1].type === "OP" &&
        ((rightAssociative(token.value as string) &&
          precedence[stack[stack.length - 1].value as string] > p1) ||
          (!rightAssociative(token.value as string) &&
            precedence[stack[stack.length - 1].value as string] >= p1))
      ) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    } else if (token.type === "LPAREN") {
      stack.push(token);
    } else if (token.type === "RPAREN") {
      while (stack.length > 0 && stack[stack.length - 1].type !== "LPAREN") {
        output.push(stack.pop()!);
      }
      if (stack.length > 0) stack.pop();
    }
  }

  while (stack.length > 0) {
    output.push(stack.pop()!);
  }

  return output;
}

function evaluateRPN(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === "NUMBER") {
      stack.push(token.value as number);
    } else if (token.type === "OP") {
      const op = token.value as string;
      if (op === "u+") {
        const a = stack.pop()!;
        stack.push(a);
      } else if (op === "u-") {
        const a = stack.pop()!;
        stack.push(-a);
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
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
  }

  return stack[0];
}

const input = fs.readFileSync(0, "utf8").trim();
const tokens = tokenize(input);
const rpn = toRPN(tokens);
const result = evaluateRPN(rpn);
console.log(result);
