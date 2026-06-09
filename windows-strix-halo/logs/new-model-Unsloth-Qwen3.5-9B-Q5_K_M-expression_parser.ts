import * as fs from 'fs';

function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expression.length) {
    const char = expression[i];
    if (char === ' ') {
      i++;
      continue;
    }
    if (/[0-9]/.test(char)) {
      let num = '';
      while (i < expression.length && /[0-9]/.test(expression[i])) {
        num += expression[i];
        i++;
      }
      tokens.push(num);
      continue;
    }
    if (['+', '-', '*', '/'].includes(char)) {
      let isUnary = true;
      if (tokens.length === 0) {
        isUnary = true;
      } else {
        const last = tokens[tokens.length - 1];
        if (['+', '-', '*', '/'].includes(last) || last === '(') {
          isUnary = true;
        }
      }
      tokens.push(char);
      i++;
      continue;
    }
    if (char === '(') {
      tokens.push('(');
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push(')');
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

function shuntingYard(tokens: string[]): string[] {
  const output: string[] = [];
  const operatorStack: string[] = [];

  const getPrecedence = (op: string): number => {
    if (['+', '-'].includes(op)) return 2;
    if (['*', '/'].includes(op)) return 3;
    return 0;
  };

  for (const token of tokens) {
    if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        output.push(operatorStack.pop() as string);
      }
      operatorStack.pop(); // remove '('
    } else if (token === '+' || token === '-' || token === '*' || token === '/') {
      const isUnary = tokens.indexOf(token) === 0 ||
        tokens[tokens.indexOf(token) - 1] === '+' ||
        tokens[tokens.indexOf(token) - 1] === '-' ||
        tokens[tokens.indexOf(token) - 1] === '*' ||
        tokens[tokens.indexOf(token) - 1] === '/' ||
        tokens[tokens.indexOf(token) - 1] === '(';
      while (operatorStack.length > 0 &&
        ['+', '-', '*', '/'].includes(operatorStack[operatorStack.length - 1]) &&
        (isUnary ? operatorStack[operatorStack.length - 1] !== '(' : getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token))) {
        output.push(operatorStack.pop() as string);
      }
      operatorStack.push(token);
    } else {
      output.push(token);
    }
  }

  while (operatorStack.length > 0) {
    output.push(operatorStack.pop() as string);
  }

  return output;
}

function evaluate(tokens: string[]): number {
  const stack: number[] = [];
  for (const token of tokens) {
    if (token === '(') {
      stack.push(evaluate(tokens));
    } else if (token === '+' || token === '-' || token === '*' || token === '/') {
      const right = stack.pop() as number;
      const left = stack.pop() as number;
      let result: number;
      if (token === '+') result = left + right;
      else if (token === '-') result = left - right;
      else if (token === '*') result = left * right;
      else result = Math.trunc(left / right);
      stack.push(result);
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
}

function parse(expression: string): number {
  const tokens = tokenize(expression);
  const postfix = shuntingYard(tokens);
  return evaluate(postfix);
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(parse(input));
