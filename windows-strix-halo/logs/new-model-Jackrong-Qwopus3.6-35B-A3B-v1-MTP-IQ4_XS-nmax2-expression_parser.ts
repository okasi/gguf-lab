import * as fs from 'fs';

type Token = {
  type: 'num';
  value: number;
} | {
  type: 'op';
  value: '+' | '-' | '*' | '/';
} | {
  type: 'lparen';
} | {
  type: 'rparen';
};

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === ' ' || c === '\t') {
      i++;
      continue;
    }
    if (c === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    if (c === '+' || c === '-' || c === '*' || c === '/') {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    // number
    let start = i;
    while (i < input.length && (input[i] >= '0' && input[i] <= '9')) {
      i++;
    }
    tokens.push({ type: 'num', value: parseInt(input.substring(start, i), 10) });
  }
  return tokens;
}

// Shunting-yard algorithm to convert to RPN
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const ops: Token[] = [];
  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  for (let j = 0; j < tokens.length; j++) {
    const token = tokens[j];
    if (token.type === 'num') {
      output.push(token);
    } else if (token.type === 'lparen') {
      ops.push(token);
    } else if (token.type === 'rparen') {
      while (ops.length > 0 && ops[ops.length - 1].type !== 'lparen') {
        output.push(ops.pop()!);
      }
      if (ops.length === 0) {
        throw new Error('Mismatched parentheses');
      }
      ops.pop(); // remove lparen
    } else if (token.type === 'op') {
      while (
        ops.length > 0 &&
        ops[ops.length - 1].type === 'op' &&
        precedence[ops[ops.length - 1].value] >= precedence[token.value]
      ) {
        output.push(ops.pop()!);
      }
      ops.push(token);
    }
  }
  while (ops.length > 0) {
    const op = ops.pop()!;
    if (op.type === 'lparen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(op);
  }
  return output;
}

// Evaluate RPN
function evaluateRPN(rpn: Token[]): number {
  const stack: number[] = [];
  for (const token of rpn) {
    if (token.type === 'num') {
      stack.push(token.value);
    } else if (token.type === 'op') {
      if (stack.length < 2) {
        throw new Error('Invalid expression');
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      let result: number;
      switch (token.value) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '/':
          if (b === 0) {
            throw new Error('Division by zero');
          }
          // Truncate toward zero
          result = Math.trunc(a / b);
          break;
        default:
          throw new Error('Unknown operator');
      }
      stack.push(result);
    }
  }
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  return stack[0];
}

// Handle unary +/- by inserting 0 before the operator
function insertUnaryZeros(tokens: Token[]): Token[] {
  const result: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'op' && (token.value === '+' || token.value === '-')) {
      // Check if it's unary:
      // It's unary if:
      // - It's the first token
      // - The previous token is an operator, lparen, or unary op
      const isUnary =
        i === 0 ||
        tokens[i - 1].type === 'op' ||
        tokens[i - 1].type === 'lparen' ||
        (tokens[i - 1].type === 'op' &&
          (tokens[i - 1].value === '+' || tokens[i - 1].value === '-'));

      if (isUnary) {
        // Insert 0 before the unary operator
        result.push({ type: 'num', value: 0 });
      }
      result.push(token);
    } else {
      result.push(token);
    }
  }
  return result;
}

function evaluate(input: string): number {
  const tokens = tokenize(input);
  const tokensWithUnary = insertUnaryZeros(tokens);
  const rpn = toRPN(tokensWithUnary);
  return evaluateRPN(rpn);
}

const input = fs.readFileSync(0, 'utf8').trim();
console.log(evaluate(input));
