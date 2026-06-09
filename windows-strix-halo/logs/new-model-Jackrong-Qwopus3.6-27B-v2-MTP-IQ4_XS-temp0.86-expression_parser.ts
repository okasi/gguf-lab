import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();

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
      let num = "";
      while (i < len && expr[i] >= "0" && expr[i] <= "9") {
        num += expr[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: parseInt(num, 10) });
    } else if (expr[i] === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
    } else if (expr[i] === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
    } else if (expr[i] === "+" || expr[i] === "-") {
      if (isUnaryContext(tokens)) {
        tokens.push({ type: "OP", value: expr[i] === "+" ? "u+" : "u-" });
      } else {
        tokens.push({ type: "OP", value: expr[i] });
      }
      i++;
    } else if (expr[i] === "*" || expr[i] === "/") {
      tokens.push({ type: "OP", value: expr[i] });
      i++;
    } else {
      throw new Error("Unexpected character: " + expr[i]);
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

  for (const token of tokens) {
    if (token.type === "NUMBER") {
      output.push(token);
    } else if (token.type === "OP") {
      while (stack.length > 0 && stack[stack.length - 1].type === "OP") {
        const top = stack[stack.length - 1].value as string;
        if (precedence[top] >= precedence[token.value as string]) {
          output.push(stack.pop()!);
        } else {
          break;
        }
      }
      stack.push(token);
    } else if (token.type === "LPAREN") {
      stack.push(token);
    } else if (token.type === "RPAREN") {
      while (stack.length > 0 && stack[stack.length - 1].type !== "LPAREN") {
        output.push(stack.pop()!);
      }
      if (stack.length > 0 && stack[stack.length - 1].type === "LPAREN") {
        stack.pop();
      }
    }
  }

  while (stack.length > 0) {
    const top = stack.pop()!;
    if (top.type === "LPAREN") {
      throw new Error("Mismatched parentheses");
    }
    output.push(top);
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
        stack.push(+a);
      } else if (op === "u-") {
        const a = stack.pop()!;
        stack.push(-a);
      } else if (op === "+") {
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(a + b);
      } else if (op === "-") {
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(a - b);
      } else if (op === "*") {
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(a * b);
      } else if (op === "/") {
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(Math.trunc(a / b));
      }
    }
  }

  return stack[0];
}

const tokens = tokenize(input);
const rpn = toRPN(tokens);
const result = evaluateRPN(rpn);
console.log(result);
