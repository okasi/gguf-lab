import * as fs from 'fs';

type Token = 
  | { type: 'number'; value: number }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'unary'; value: '+' | '-' }
  | { type: 'parenthesis'; value: '(' | ')' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let lastTokenType: 'number' | 'operator' | 'parenthesis' | null = null;

  while (i < expr.length) {
    const char = expr[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d/.test(char)) {
      let numStr = '';
      while (i < expr.length && /\d/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseInt(numStr, 10) });
      lastTokenType = 'number';
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'parenthesis', value: char });
      lastTokenType = 'parenthesis';
      i++;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/') {
      let isUnary = false;
      if ((char === '+' || char === '-') && (lastTokenType === null || lastTokenType === 'operator' || lastTokenType === 'parenthesis')) {
        isUnary = true;
      }

      if (isUnary) {
        tokens.push({ type: 'unary', value: char as '+' | '-' });
      } else {
        tokens.push({ type: 'operator', value: char as '+' | '-' | '*' | '/' });
      }
      lastTokenType = 'operator';
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

function getPrecedence(token: Token): number {
  if (token.type === 'unary') return 3;
  if (token.type === 'operator' && (token.value === '*' || token.value === '/')) return 2;
  if (token.type === 'operator' && (token.value === '+' || token.value === '-')) return 1;
  return 0;
}

function isRightAssociative(token: Token): boolean {
  if (token.type === 'unary') return true;
  return false;
}

function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'unary') {
      while (
        opStack.length > 0 &&
        getPrecedence(opStack[opStack.length - 1]) > getPrecedence(token)
      ) {
        output.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token.type === 'operator') {
      while (
        opStack.length > 0 &&
        (getPrecedence(opStack[opStack.length - 1]) > getPrecedence(token) ||
          (getPrecedence(opStack[opStack.length - 1]) === getPrecedence(token) &&
            !isRightAssociative(token)))
      ) {
        output.push(opStack.pop()!);
      }
      opStack.push(token);
    } else if (token.type === 'parenthesis') {
      if (token.value === '(') {
        opStack.push(token);
      } else {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1].type !== 'parenthesis'
        ) {
          output.push(opStack.pop()!);
        }
        if (
          opStack.length > 0 &&
          opStack[opStack.length - 1].type === 'parenthesis'
        ) {
          opStack.pop();
        }
      }
    }
  }

  while (opStack.length > 0) {
    output.push(opStack.pop()!);
  }

  return output;
}

function evaluateRPN(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'unary') {
      const a = stack.pop()!;
      if (token.value === '+') {
        stack.push(a);
      } else {
        stack.push(-a);
      }
    } else if (token.type === 'operator') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token.value) {
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

function main(): void {
  const expr = fs.readFileSync(0, 'utf8').trim();
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  const result = evaluateRPN(rpn);
  console.log(result);
}

main();
