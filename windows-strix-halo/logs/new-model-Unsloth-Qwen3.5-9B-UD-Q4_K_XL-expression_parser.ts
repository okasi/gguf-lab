import { readFileSync } from 'fs';

interface Token {
  type: 'NUMBER' | 'UNARY_PLUS' | 'UNARY_MINUS' | 'UNARY_DIV' | 'BINARY_PLUS' | 'BINARY_MINUS' | 'BINARY_MUL' | 'BINARY_DIV' | 'LPAREN' | 'RPAREN' | 'EOF';
  value: string | number;
}

class Tokenizer {
  private input: string;
  private pos: number;

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
  }

  peek(): string | undefined {
    return this.pos < this.input.length ? this.input[this.pos] : undefined;
  }

  consume(): string | undefined {
    if (this.pos < this.input.length) {
      const char = this.input[this.pos];
      this.pos++;
      return char;
    }
    return undefined;
  }

  skipSpaces(): void {
    while (this.peek() !== undefined && (this.peek() === ' ' || this.peek() === '\n' || this.peek() === '\t')) {
      this.pos++;
    }
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.peek() !== undefined) {
      this.skipSpaces();

      if (this.peek() === undefined) {
        tokens.push({ type: 'EOF', value: 0 });
        break;
      }

      if (this.peek() !== undefined && this.peek() !== ' ' && this.peek() !== '\n' && this.peek() !== '\t') {
        if (this.peek() === '0' || this.peek() === '1' || this.peek() === '2' || this.peek() === '3' || this.peek() === '4' || this.peek() === '5' || this.peek() === '6' || this.peek() === '7' || this.peek() === '8' || this.peek() === '9') {
          const numStr = this.consumeNumber();
          tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        } else if (this.peek() === '(') {
          tokens.push({ type: 'LPAREN', value: 0 });
          this.consume();
        } else if (this.peek() === ')') {
          tokens.push({ type: 'RPAREN', value: 0 });
          this.consume();
        } else if (this.peek() === '+') {
          this.consume();
        } else if (this.peek() === '-') {
          this.consume();
        } else if (this.peek() === '*') {
          this.consume();
        } else if (this.peek() === '/') {
          this.consume();
        }
      }
    }

    tokens.push({ type: 'EOF', value: 0 });
    return tokens;
  }

  private consumeNumber(): string {
    let numStr = '';
    while (this.peek() !== undefined && (this.peek() === '0' || this.peek() === '1' || this.peek() === '2' || this.peek() === '3' || this.peek() === '4' || this.peek() === '5' || this.peek() === '6' || this.peek() === '7' || this.peek() === '8' || this.peek() === '9' || this.peek() === '.')) {
      numStr += this.consume()!;
    }
    return numStr;
  }
}

class Parser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek(): Token {
    return this.tokens[this.pos];
  }

  consume(): Token {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  parse(): number {
    return this.expression();
  }

  private expression(): number {
    let left = this.term();
    while (this.peek().type === 'BINARY_PLUS' || this.peek().type === 'BINARY_MINUS') {
      const op = this.consume();
      const right = this.term();
      if (op.type === 'BINARY_PLUS') {
        left = left + right;
      } else {
        left = left - right;
      }
    }
    return left;
  }

  private term(): number {
    let left = this.factor();
    while (this.peek().type === 'BINARY_MUL' || this.peek().type === 'BINARY_DIV') {
      const op = this.consume();
      const right = this.factor();
      if (op.type === 'BINARY_MUL') {
        left = left * right;
      } else {
        left = Math.trunc(left / right);
      }
    }
    return left;
  }

  private factor(): number {
    const token = this.peek();
    if (token.type === 'UNARY_PLUS') {
      this.consume();
      return this.factor();
    }
    if (token.type === 'UNARY_MINUS') {
      this.consume();
      return -this.factor();
    }
    if (token.type === 'UNARY_DIV') {
      this.consume();
      return 1 / this.factor();
    }
    if (token.type === 'NUMBER') {
      this.consume();
      return token.value as number;
    }
    if (token.type === 'LPAREN') {
      this.consume();
      const result = this.expression();
      this.consume();
      return result;
    }
    return 0;
  }
}

function evaluateExpression(expression: string): number {
  const tokenizer = new Tokenizer(expression);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  return parser.parse();
}

const input = readFileSync(0, 'utf8').trim();
console.log(evaluateExpression(input));
