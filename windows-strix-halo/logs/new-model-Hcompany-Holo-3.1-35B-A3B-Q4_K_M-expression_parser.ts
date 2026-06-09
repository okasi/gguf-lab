const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();

// Tokenizer
function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  let num = '';
  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i];
    if (/\d/.test(ch)) {
      num += ch;
    } else {
      if (num) {
        tokens.push(num);
        num = '';
      }
      if (/[+*/()-]/.test(ch)) {
        tokens.push(ch);
      }
    }
  }
  if (num) {
    tokens.push(num);
  }
  return tokens;
}

// Shunting-yard algorithm
function shuntingYard(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: string[] = [];
  const precedence: { [key: string]: number } = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'u+': 3,
    'u-': 3,
  };
  const isOperator = (token: string): boolean => /[+\-*/]/.test(token);
  const is unaryOperator = (token: string, index: number): boolean => {
    if (token !== '+' && token !== '-') return false;
    if (index === 0) return true;
    const prev = tokens[index - 1];
    return prev === '(' || isOperator(prev);
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/\d/.test(token)) {
      output.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop(); // Remove '('
    } else if (isOperator(token)) {
      if (isUnaryOperator(token, i)) {
        operators.push('u' + token);
      } else {
        while (
          operators.length &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop()!);
        }
        operators.push(token);
      }
    }
  }
  while (operators.length) {
    output.push(operators.pop()!);
  }
  return output;
}

// Evaluate postfix expression
function evaluatePostfix(postfix: string[]): number {
  const stack: number[] = [];
  for (const token of postfix) {
    if (/\d/.test(token)) {
      stack.push(parseInt(token, 10));
    } else if (token === 'u+') {
      stack.push(stack.pop()!);
    } else if (token === 'u-') {
      stack.push(-stack.pop()!);
    } else {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
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
const postfix = shuntingYard(tokens);
console.log(evaluatePostfix(postfix));
