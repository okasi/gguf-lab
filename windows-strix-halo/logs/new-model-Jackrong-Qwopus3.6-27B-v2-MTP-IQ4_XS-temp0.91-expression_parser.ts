import * as fs from "fs";

interface Token {
  type: "NUM" | "OP" | "LPAREN" | "RPAREN";
  value: number | string;
  isUnary: boolean;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
      i++;
      continue;
    }

    if (ch >= "0" && ch <= "9") {
      let num = 0;
      while (i < input.length && input[i] >= "0" && input[i] <= "9") {
        num = num * 10 + (input[i].charCodeAt(0) - 48);
        i++;
      }
      tokens.push({ type: "NUM", value: num, isUnary: false });
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(", isUnary: false });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")", isUnary: false });
      i++;
      continue;
    }

    if (ch === "+" || ch === "-") {
      const isUnary =
        tokens.length === 0 ||
        tokens[tokens.length - 1].type === "OP" ||
        tokens[tokens.length - 1].type === "LPAREN";

      if (isUnary) {
        tokens.push({ type: "OP", value: ch === "+" ? "u+" : "u-", isUnary: true });
      } else {
        tokens.push({ type: "OP", value: ch, isUnary: false });
      }
      i++;
      continue;
    }

    if (ch === "*" || ch === "/") {
      tokens.push({ type: "OP", value: ch, isUnary: false });
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

function precedence(op: string, isUnary: boolean): number {
  if (isUnary) return 4;
  if (op === "*" || op === "/") return 3;
  if (op === "+" || op === "-") return 2;
  return 1;
}

function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    if (token.type === "NUM") {
      output.push(token);
    } else if (token.type === "LPAREN") {
      stack.push(token);
    } else if (token.type === "RPAREN") {
      while (stack.length > 0 && stack[stack.length - 1].type !== "LPAREN") {
        output.push(stack.pop()!);
      }
      if (stack.length > 0 && stack[stack.length - 1].type === "LPAREN") {
        stack.pop();
      }
    } else if (token.type === "OP") {
      const currPrec = precedence(token.value as string, token.isUnary);
      while (
        stack.length > 0 &&
        stack[stack.length - 1].type === "OP"
      ) {
        const top = stack[stack.length - 1];
        const topPrec = precedence(top.value as string, top.isUnary);

        if (
          (token.isUnary && currPrec < topPrec) ||
          (!token.isUnary && currPrec <= topPrec)
        ) {
          output.push(stack.pop()!);
        } else {
          break;
        }
      }
      stack.push(token);
    }
  }

  while (stack.length > 0) {
    const t = stack.pop()!;
    if (t.type !== "LPAREN") {
      output.push(t);
    }
  }

  return output;
}

function evaluate(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === "NUM") {
      stack.push(token.value as number);
    } else if (token.type === "OP") {
      const op = token.value as string;

      if (token.isUnary) {
        const a = stack.pop()!;
        if (op === "u+") {
          stack.push(a);
        } else {
          stack.push(-a);
        }
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;

        if (op === "+") {
          stack.push(a + b);
        } else if (op === "-") {
          stack.push(a - b);
        } else if (op === "*") {
          stack.push(a * b);
        } else if (op === "/") {
          stack.push(Math.trunc(a / b));
        }
      }
    }
  }

  return stack[0];
}

const input = fs.readFileSync(0, "utf8").trim();
const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluate(rpn);
console.log(result);
