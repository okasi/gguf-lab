import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();

interface Token {
  type: 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN';
  value: string;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = expr.length;
  while (i < len) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      let num = '';
      while (i < len && expr[i] >= '0' && expr[i] <= '9') {
        num += expr[i++];
      }
      tokens.push({ type: 'NUMBER', value: num });
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'OP', value: ch });
      i++;
    } else if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  parse(): number {
    return this.parseExpr();
  }

  private parseExpr(): number {
    let left = this.parseTerm();
    while (this.peek()?.type === 'OP' && (this.peek()!.value === '+' || this.peek()!.value === '-')) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  private parseTerm(): number {
    let left = this.parseFactor();
    while (this.peek()?.type === 'OP' && (this.peek()!.value === '*' || this.peek()!.value === '/')) {
      const op = this.consume().value;
      const right = this.parseFactor();
      left = op === '*' ? left * right : Math.trunc(left / right);
    }
    return left;
  }

  private parseFactor(): number {
    const token = this.peek();
    if (token?.type === 'OP' && (token.value === '+' || token.value === '-')) {
      this.consume();
      const value = this.parseFactor();
      return token.value === '+' ? value : -value;
    }
    if (token?.type === 'LPAREN') {
      this.consume();
      const value = this.parseExpr();
      if (this.peek()?.type === 'RPAREN') {
        this.consume();
      }
      return value;
    }
    if (token?.type === 'NUMBER') {
      this.consume();
      return parseInt(token.value, 10);
    }
    return 0;
  }
}

const tokens = tokenize(input);
const parser = new Parser(tokens);
console.log(parser.parse());
