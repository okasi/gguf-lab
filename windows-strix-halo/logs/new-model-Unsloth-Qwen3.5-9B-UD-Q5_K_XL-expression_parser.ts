import fs from 'fs';

type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'LPAREN' | 'RPAREN' | 'EOF';

interface Token {
  type: TokenType;
  value: number;
}

class Tokenizer {
  private input: string;
  private pos: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string {
    return this.pos < this.input.length ? this.input[this.pos] : '';
  }

  private advance(): string {
    return this.input[this.pos++];
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.advance();

      if (/\d/.test(ch)) {
        let numStr = ch;
        while (this.pos < this.input.length && /\d/.test(this.peek())) {
          numStr += this.advance();
        }
        tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10) });
      } else if (ch === '+') {
        tokens.push({ type: 'PLUS', value: 0 });
      } else if (ch === '-') {
        tokens.push({ type: 'MINUS', value: 0 });
      } else if (ch === '*') {
        tokens.push({ type: 'STAR', value: 0 });
      } else if (ch === '/') {
        tokens.push({ type: 'SLASH', value: 0 });
      } else if (ch === '(') {
        tokens.push({ type: 'LPAREN', value: 0 });
      } else if (ch === ')') {
        tokens.push({ type: 'RPAREN', value: 0 });
      } else {
        // Skip unknown characters
        this.pos--;
      }
    }

    tokens.push({ type: 'EOF', value: 0 });
    return tokens;
  }
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

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  public parse(): number {
    const result = this.parseExpression();
    if (this.peek().type !== 'EOF') {
      throw new Error('Unexpected token after expression');
    }
    return result;
  }

  private parseExpression(): number {
    let left = this.parseUnary();

    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.advance();
      const right = this.parseUnary();
      if (op.type === 'PLUS') {
        left = left + right;
      } else {
        left = left - right;
      }
    }
    return left;
  }

  private parseUnary(): number {
    if (this.peek().type === 'PLUS') {
      this.advance();
      return this.parseUnary();
    }
    if (this.peek().type === 'MINUS') {
      this.advance();
      return -this.parseUnary();
    }
    return this.parseTerm();
  }

  private parseTerm(): number {
    let left = this.parsePrimary();

    while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
      const op = this.advance();
      const right = this.parsePrimary();
      if (op.type === 'STAR') {
        left = left * right;
      } else {
        left = Math.trunc(left / right);
      }
    }
    return left;
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (token.type === 'NUMBER') {
      this.advance();
      return token.value;
    }
    if (token.type === 'LPAREN') {
      this.advance();
      const result = this.parseExpression();
      if (this.peek().type === 'RPAREN') {
        this.advance();
      }
      return result;
    }
    throw new Error(`Unexpected token: ${token.type}`);
  }
}

const input = fs.readFileSync(0, 'utf8').trim();

const tokenizer = new Tokenizer(input);
const tokens = tokenizer.tokenize();
const parser = new Parser(tokens);

const result = parser.parse();
console.log(result);
