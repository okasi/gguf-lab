import * as fs from "fs";

const input = fs.readFileSync(0, "utf8").trim();

type OperatorType = '+' | '-' | '*' | '/' | '(' | ')';
type Operator = { type: OperatorType, precedence: number };
type Token = number | Operator;

const operators: { [key in OperatorType]: Operator } = {
  '+': { type: '+', precedence: 1 },
  '-': { type: '-', precedence: 1 },
  '*': { type: '*', precedence: 2 },
  '/': { type: '/', precedence: 2 },
  '(': { type: '(', precedence: 0 },
  ')': { type: ')', precedence: 0 }
};

function shuntingYard(expression: string): Token[] {
  const queue: Token[] = [];
  const stack: Operator[] = [];

  let currentNumber = "";
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\d/.test(char) || char === '.') {
      currentNumber += char;
    } else if (char === '+' || char === '-' || char === '*' || char === '/' || char === '(' || char === ')') {
      if (currentNumber.length > 0) {
        queue.push(parseFloat(currentNumber));
        currentNumber = "";
      }

      const op = operators[char];
      if (op.type === '(') {
        stack.push(op);
      } else if (op.type === ')') {
        while (stack.length > 0 && stack[stack.length - 1].type !== '(') {
          queue.push(stack.pop()!);
        }
        stack.pop();
      } else {
        while (stack.length > 0 && stack[stack.length - 1].precedence >= op.precedence) {
          queue.push(stack.pop()!);
        }
        stack.push(op);
      }
    }

    index++;
  }

  if (currentNumber.length > 0) {
    queue.push(parseFloat(currentNumber));
  }

  while (stack.length > 0) {
    queue.push(stack.pop()!);
  }

  return queue;
}

function evaluate(expression: string): number {
  const queue = shuntingYard(expression);
  const stack: number[] = [];

  for (const token of queue) {
    if (typeof token === "number") {
      stack.push(token);
    } else {
      const right = stack.pop()!;
      const left = stack.pop()!;
      switch (token.type) {
        case '+':
          stack.push(left + right);
          break;
        case '-':
          stack.push(left - right);
          break;
        case '*':
          stack.push(left * right);
          break;
        case '/':
          stack.push(Math.trunc(left / right));
          break;
      }
    }
  }

  return stack[0];
}

console.log(evaluate(input));
