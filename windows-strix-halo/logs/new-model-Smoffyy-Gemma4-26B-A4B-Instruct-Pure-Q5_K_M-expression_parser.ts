import * as fs from 'fs';

enum TokenType {
  NUMBER,
  PLUS,
  MINUS,
  MUL,
  DIV,
  LPAREN,
  RPAREN,
  EOF,
}

interface Token {
  type: TokenType;
  value?: number;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (/\d/.test(char)) {
      let numStr = '';
      while (i < input.length && /\d/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: TokenType.NUMBER, value: parseInt(numStr, 10) });
      continue;
    }
    if (char === '+') tokens.push({ type: TokenType.PLUS });
    else if (char === '-') tokens.push({ type: TokenType.MINUS });
    else if (char === '*') tokens.push({ type: TokenType.MUL });
    else if (char === '/') tokens.push({ type: TokenType.DIV });
    else if (char === '(') tokens.push({ type: TokenType.LPAREN });
    else if (char === ')') tokens.push({ type: TokenType.RPAREN });
    i++;
  }
  tokens.push({ type: TokenType.EOF });
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  public parseExpression(): number {
    let node = this.parseTerm();
    while (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS) {
      const op = this.consume().type;
      const right = this.parseTerm();
      if (op === TokenType.PLUS) {
        node += right;
      } else {
        node -= right;
      }
    }
    return node;
  }

  private parseTerm(): number {
    let node = this.parseUnary();
    while (this.peek().type === TokenType.MUL || this.peek().type === TokenType.DIV) {
      const op = this.consume().type;
      const right = this.parseUnary();
      if (op === TokenType.MUL) {
        node *= right;
      } else {
        node = Math.trunc(node / right);
      }
    }
    return node;
  }

  private parseUnary(): number {
    const token = this.peek();
    if (token.type === TokenType.PLUS) {
      this.consume();
      return this.parseUnary();
    } else if (token.type === TokenType.MINUS) {
      this.consume();
      return -this.parseUnary();
    } else {
      return this.parsePrimary();
    }
  }

  private parsePrimary(): number {
    const token = this.consume();
    if (token.type === TokenType.NUMBER) {
      return token.value!;
    } else if (token.type === TokenType.LPAREN) {
      const val = this.parseExpression();
      this.consume(); // consume RPAREN
      return val;
    }
    throw new Error('Unexpected token');
  }
}

function main() {
  const input = fs.readFileSync(0, 'utf8');
  if (!input.trim()) return;
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  const result = parser.parseExpression();
  process.stdout.write(result.toString() + '\n');
}

main();
