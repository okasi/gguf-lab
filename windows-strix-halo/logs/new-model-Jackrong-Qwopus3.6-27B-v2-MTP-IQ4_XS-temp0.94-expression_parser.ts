import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();

type TokenKind = 'NUMBER' | 'UNARY' | 'BINARY' | 'LPAREN' | 'RPAREN';

interface Token {
  kind: TokenKind;
  value: string;
  prec: number;
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let afterOperand = false;

  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      let s = '';
      while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
        s += expr[i++];
      }
      tokens.push({ kind: 'NUMBER', value: s, prec: -1 });
      afterOperand = true;
      continue;
    }
    if (ch === '+') {
      tokens.push(afterOperand
        ? { kind: 'BINARY', value: '+', prec: 1 }
        : { kind: 'UNARY', value: '+', prec: 4 });
      afterOperand = false;
      i++;
      continue;
    }
    if (ch === '-') {
      tokens.push(afterOperand
        ? { kind: 'BINARY', value: '-', prec: 1 }
        : { kind: 'UNARY', value: '-', prec: 4 });
      afterOperand = false;
      i++;
      continue;
    }
    if (ch === '*') {
      tokens.push({ kind: 'BINARY', value: '*', prec: 2 });
      afterOperand = false;
      i++;
      continue;
    }
    if (ch === '/') {
      tokens.push({ kind: 'BINARY', value: '/', prec: 2 });
      afterOperand = false;
      i++;
      continue;
    }
    if (ch === '(') {
      afterOperand = false;
      tokens.push({ kind: 'LPAREN', value: '(', prec: -1 });
      i++;
      continue;
    }
    if (ch === ')') {
      afterOperand = true;
      tokens.push({ kind: 'RPAREN', value: ')', prec: -1 });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const t of tokens) {
    if (t.kind === 'NUMBER') {
      output.push(t);
    } else if (t.kind === 'UNARY') {
      stack.push(t);
    } else if (t.kind === 'BINARY') {
      while (stack.length > 0
        && stack[stack.length - 1].kind !== 'LPAREN'
        && stack[stack.length - 1].prec >= t.prec) {
        output.push(stack.pop()!);
      }
      stack.push(t);
    } else if (t.kind === 'LPAREN') {
      stack.push(t);
    } else if (t.kind === 'RPAREN') {
      while (stack.length > 0 && stack[stack.length - 1].kind !== 'LPAREN') {
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

  for (const t of rpn) {
    if (t.kind === 'NUMBER') {
      stack.push(Number(t.value));
    } else if (t.kind === 'UNARY') {
      const a = stack.pop()!;
      stack.push(t.value === '+' ? a : -a);
    } else {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (t.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(Math.trunc(a / b));
          break;
      }
    }
  }

  return stack[0];
}

const tokens = tokenize(input);
const rpn = shuntingYard(tokens);
const result = evaluateRPN(rpn);

console.log(result);
