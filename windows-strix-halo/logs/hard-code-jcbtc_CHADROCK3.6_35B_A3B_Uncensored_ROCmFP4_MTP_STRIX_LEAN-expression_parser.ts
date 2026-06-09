import * as fs from "fs";

function evaluateExpression(expression: string): number {
  const tokens: string[] = tokenize(expression);
  const parser = new Parser(tokens);
  return parser.parseExpression();
}

interface Token {
  type: "number" | "op" | "lparen" | "rparen";
  value: string;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = input.trim();
  while (i < s.length) {
    if (s[i] === " ") {
      i++;
      continue;
    }
    if (s[i] === "(") {
      tokens.push("(");
      i++;
    } else if (s[i] === ")") {
      tokens.push(")");
      i++;
    } else if (s[i] === "+" || s[i] === "-" || s[i] === "*" || s[i] === "/") {
      // Check if it's unary
      if (s[i] === "+" || s[i] === "-") {
        // Unary if it's the first token, or after an operator or opening paren
        const isUnary =
          tokens.length === 0 ||
          tokens[tokens.length - 1] === "(" ||
          isOperator(tokens[tokens.length - 1]);
        if (isUnary) {
          // Consume the sign
          let sign = s[i];
          i++;
          // Skip spaces after sign
          while (i < s.length && s[i] === " ") i++;
          // Next must be a number
          if (i < s.length && (s[i] >= "0" && s[i] <= "9" || s[i] === "(")) {
            if (sign === "-") {
              // We'll handle the sign by prepending a negative number or using a unary op
              // Let's just push the sign as part of the number parsing logic or as a unary operator
              // Simpler: push a unary operator token
              tokens.push(sign);
            } else {
              // unary +, just skip
            }
          } else {
            // Unexpected
            throw new Error("Unexpected token after unary operator");
          }
          continue;
        }
      }
      tokens.push(s[i]);
      i++;
    } else if (s[i] >= "0" && s[i] <= "9") {
      let num = "";
      while (i < s.length && s[i] >= "0" && s[i] <= "9") {
        num += s[i];
        i++;
      }
      tokens.push(num);
    } else {
      throw new Error(`Unexpected character: ${s[i]}`);
    }
  }
  return tokens;
}

function isOperator(op: string): boolean {
  return op === "+" || op === "-" || op === "*" || op === "/";
}

class Parser {
  private tokens: string[];
  private pos: number;

  constructor(tokens: string[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): string | undefined {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : undefined;
  }

  private consume(): string {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  parseExpression(): number {
    return this.parseAddSub();
  }

  private parseAddSub(): number {
    let left = this.parseMulDiv();
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.consume();
      const right = this.parseMulDiv();
      if (op === "+") {
        left = left + right;
      } else {
        left = left - right;
      }
    }
    return left;
  }

  private parseMulDiv(): number {
    let left = this.parseUnary();
    while (this.peek() === "*" || this.peek() === "/") {
      const op = this.consume();
      const right = this.parseUnary();
      if (op === "*") {
        left = left * right;
      } else {
        // Division truncates toward zero
        left = left / right;
        if (left > 0) {
          left = Math.floor(left);
        } else {
          left = Math.ceil(left);
        }
      }
    }
    return left;
  }

  private parseUnary(): number {
    if (this.peek() === "-") {
      this.consume();
      const val = this.parseUnary();
      return -val;
    }
    if (this.peek() === "+") {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (token === undefined) {
      throw new Error("Unexpected end of input");
    }
    if (token === "(") {
      this.consume(); // consume (
      const val = this.parseExpression();
      if (this.peek() !== ")") {
        throw new Error("Expected ')'");
      }
      this.consume(); // consume )
      return val;
    }
    if (token === "-" || token === "+" || token === "*" || token === "/") {
      // This case is handled by parseUnary, but if we get here, it's an error
      throw new Error(`Unexpected operator: ${token}`);
    }
    // Must be a number
    if (!/^-?\d+$/.test(token)) {
      throw new Error(`Invalid number: ${token}`);
    }
    this.consume();
    return parseInt(token, 10);
  }
}

const input = fs.readFileSync(0, "utf8").trim();
const result = evaluateExpression(input);
console.log(result);
