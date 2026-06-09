import * as fs from 'fs';

type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; symbol: string; unary: boolean }
  | { type: 'leftParen' }
  | { type: 'rightParen' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < expr.length && expr[j] >= '0' && expr[j] <= '9') {
        j++;
      }
      tokens.push({ type: 'number', value: parseInt(expr.substring(i, j), 10) });
      i = j;
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      const unary = tokens.length === 0 || tokens[tokens.length - 1].type === 'operator' || tokens[tokens.length - 1].type === 'leftParen';
      tokens.push({ type: 'operator', symbol: ch, unary });
      i++;
    } else if (ch === '(') {
      tokens.push({ type: 'leftParen' });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'rightParen' });
      i++;
    } else {
      throw new Error(`Unexpected character: ${ch}`);
    }
  }
  return tokens;
}

function getPrecedence(symbol: string, unary: boolean): number {
  if (unary) return 3;
  if (symbol === '*' || symbol === '/') return 2;
  if (symbol === '+' || symbol === '-') return 1;
  return 0;
}

function isRightAssociative(symbol: string, unary: boolean): boolean {
  return unary;
}

function toPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'operator') {
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1].type === 'operator' &&
        (isRightAssociative(token.symbol, token.unary)
          ? getPrecedence(token.symbol, token.unary) < getPrecedence(opStack[opStack.length - 1].symbol, (opStack[opStack.length - 1] as any).unary)
          : getPrecedence(token.symbol, token.unary) <= getPrecedence(opStack[opStack.length - 1].symbol, (opStack[opStack.length - 1] as any).unary))
      ) {
        output.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token.type === 'leftParen') {
      opStack.push(token);
    } else if (token.type === 'rightParen') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'leftParen') {
        output.push(opStack.pop()!);
      }
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'leftParen') {
        opStack.pop();
      }
    }
  }

  while (opStack.length > 0) {
    output.push(opStack.pop()!);
  }

  return output;
}

function evaluatePostfix(tokens: Token[]): number {
  const stack: number[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'operator') {
      if (token.unary) {
        const val = stack.pop()!;
        if (token.symbol === '+') {
          stack.push(val);
        } else if (token.symbol === '-') {
          stack.push(-val);
        }
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        if (token.symbol === '+') {
          stack.push(a + b);
        } else if (token.symbol === '-') {
          stack.push(a - b);
        } else if (token.symbol === '*') {
          stack.push(a * b);
        } else if (token.symbol === '/') {
          stack.push(Math.trunc(a / b));
        }
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return stack[0];
}

const expression = fs.readFileSync(0, 'utf8').trim();
const tokens = tokenize(expression);
const postfix = toPostfix(tokens);
const result = evaluatePostfix(postfix);
console.log(result);
