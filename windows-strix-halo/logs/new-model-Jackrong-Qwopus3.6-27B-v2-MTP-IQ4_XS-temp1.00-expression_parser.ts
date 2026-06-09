import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();

interface Token {
  type: "number" | "operator" | "paren";
  value: string;
}

function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === " ") {
      i++;
      continue;
    }
    if (s[i] >= "0" && s[i] <= "9") {
      let j = i;
      while (j < s.length && s[j] >= "0" && s[j] <= "9") j++;
      tokens.push({ type: "number", value: s.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/".includes(s[i])) {
      tokens.push({ type: "operator", value: s[i] });
      i++;
      continue;
    }
    if (s[i] === "(" || s[i] === ")") {
      tokens.push({ type: "paren", value: s[i] });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

function precedence(op: string, isUnary: boolean): number {
  if (isUnary && (op === "+" || op === "-")) return 3;
  if (op === "*" || op === "/") return 2;
  if (op === "+" || op === "-") return 1;
  return 0;
}

function isRightAssociative(op: string): boolean {
  return false; // none of our operators are right-associative
}

// Shunting-yard
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
    } else if (token.type === "paren" && token.value === "(") {
      stack.push(token);
    } else if (token.type === "paren" && token.value === ")") {
      while (stack.length > 0 && stack[stack.length - 1].value !== "(") {
        output.push(stack.pop()!);
      }
      stack.pop(); // pop '('
    } else if (token.type === "operator") {
      // Determine if unary
      const isUnary = (
        output.length === 0 && stack.length === 0 ||
        (stack.length > 0 && (
          stack[stack.length - 1].value === "(" ||
          (stack[stack.length - 1].type === "operator" && stack[stack.length - 1].value !== ")")
        )) ||
        (output.length > 0 && stack.length > 0 && stack[stack.length - 1].value === "(")
      );

      // Actually, the standard way to check: if the previous token (in the output or stack) was an operator or '(' or it's the first token
      // Let me reconsider. The token before this operator in the sequence determines if it's unary.
      // After tokenizing, we check what came before in the tokens array.
      
      // Let me redo: track the previous token type
    }
  }
  
  // Let me reconsider the approach. I'll track whether each operator is unary as I parse.
  
  while (stack.length > 0) {
    output.push(stack.pop()!);
  }
  
  return output;
}
