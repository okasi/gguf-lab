import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

if (input === '') {
  process.exit(0);
}

type Token = { type: 'number'; value: number } | { type: 'op'; value: '+' | '-' | '*' | '/' };

let pos = 0;
const str = input;

function peek(): string | undefined {
  if (pos >= str.length) return undefined;
  return str[pos];
}

function skipSpaces(): void {
  while (pos < str.length && str[pos] === ' ') {
    pos++;
  }
}

function parseNumber(): Token {
  skipSpaces();
  const start = pos;
  while (pos < str.length && (str[pos] >= '0' && str[pos] <= '9')) {
    pos++;
  }
  if (start === pos) {
    throw new Error('Expected number');
  }
  const numStr = str.substring(start, pos);
  const value = parseInt(numStr, 10);
  if (isNaN(value)) {
    throw new Error('Invalid number');
  }
  return { type: 'number', value };
}

function parseToken(): Token {
  skipSpaces();
  const char = peek();
  if (char === undefined) {
    throw new Error('Unexpected end of input');
  }
  if (char >= '0' && char <= '9') {
    return parseNumber();
  }
  if (char === '+' || char === '-' || char === '*' || char === '/') {
    pos++;
    return { type: 'op', value: char as any };
  }
  if (char === '(') {
    pos++;
    skipSpaces();
    const expr = parseExpression();
    skipSpaces();
    const close = peek();
    if (close !== ')') {
      throw new Error('Expected closing parenthesis');
    }
    pos++;
    return expr;
  }
  throw new Error(`Unexpected character: ${char}`);
}

function isUnaryOp(token: Token, isStart: boolean): boolean {
  if (token.type !== 'op') return false;
  return token.value === '+' || token.value === '-';
}

// Grammar:
// expression -> term (('+' | '-') term)*
// term -> unary (('*' | '/') unary)*
// unary -> ('+' | '-') unary | primary
// primary -> '(' expression ')' | number

function parseExpression(): Token {
  let left = parseTerm();
  
  while (true) {
    skipSpaces();
    const char = peek();
    if (char === '+' || char === '-') {
      pos++;
      const right = parseTerm();
      left = { type: 'op', value: char as any };
      // We need to handle binary ops. Let's refactor to return values.
    } else {
      break;
    }
  }
  
  // Actually, let's use a value-based approach for easier evaluation.
  return left; // This is a bit messy. Let's rewrite with value computation.
}

// Let's use shunting-yard algorithm to convert to RPN and evaluate.

type Operator = '+' | '-' | '*' | '/';

interface ShuntingYardToken {
  type: 'number' | 'op';
  value: number | Operator;
  isUnary?: boolean;
  precedence: number;
  associativity: 'left' | 'right';
}

function tokenize(): ShuntingYardToken[] {
  const tokens: ShuntingYardToken[] = [];
  pos = 0;
  
  while (pos < str.length) {
    skipSpaces();
    if (pos >= str.length) break;
    
    const char = str[pos];
    
    if (char >= '0' && char <= '9') {
      const start = pos;
      while (pos < str.length && str[pos] >= '0' && str[pos] <= '9') {
        pos++;
      }
      const numStr = str.substring(start, pos);
      const value = parseInt(numStr, 10);
      tokens.push({ type: 'number', value, precedence: 0, associativity: 'left' });
    } else if (char === '(') {
      tokens.push({ type: 'op', value: '(', precedence: 0, associativity: 'left' });
      pos++;
    } else if (char === ')') {
      tokens.push({ type: 'op', value: ')', precedence: 0, associativity: 'left' });
      pos++;
    } else if (char === '+' || char === '-' || char === '*' || char === '/') {
      const op = char as Operator;
      let unary = false;
      
      // Check if unary
      if (op === '+' || op === '-') {
        // It's unary if it's the first token, or after an opening parenthesis, or after another operator
        const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;
        if (!prev || prev.value === '(' || prev.type === 'op') {
          unary = true;
        }
      }
      
      let precedence = 0;
      if (op === '*' || op === '/') {
        precedence = 2;
      } else if (op === '+' || op === '-') {
        precedence = 1;
      }
      
      const isRightAssociative = op === '+' || op === '-'; // Unary is right associative
      
      tokens.push({ 
        type: 'op', 
        value: op, 
        isUnary: unary,
        precedence, 
        associativity: unary ? 'right' : 'left' 
      });
      pos++;
    } else {
      throw new Error(`Unexpected character: ${char}`);
    }
  }
  
  return tokens;
}

function shuntingYard(tokens: ShuntingYardToken[]): ShuntingYardToken[] {
  const output: ShuntingYardToken[] = [];
  const operatorStack: ShuntingYardToken[] = [];
  
  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'op') {
      if (token.value === '(') {
        operatorStack.push(token);
      } else if (token.value === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
          output.push(operatorStack.pop()!);
        }
        if (operatorStack.length === 0) {
          throw new Error('Mismatched parentheses');
        }
        operatorStack.pop(); // Remove '('
      } else {
        // Operator
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].value !== '(') {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'op' && 
              ((top.isUnary && token.isUnary && top.associativity === 'right') ||
               (!top.isUnary && !token.isUnary && top.precedence >= token.precedence)) ||
              (!top.isUnary && token.isUnary && top.precedence >= token.precedence)) {
            output.push(operatorStack.pop()!);
          } else {
            break;
          }
        }
        operatorStack.push(token);
      }
    }
  }
  
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.value === '(' || top.value === ')') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }
  
  return output;
}

function evaluateRPN(rpn: ShuntingYardToken[]): number {
  const stack: number[] = [];
  
  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value);
    } else if (token.type === 'op' && typeof token.value === 'string') {
      if (token.isUnary) {
        if (stack.length < 1) {
          throw new Error('Insufficient operands for unary operator');
        }
        const operand = stack.pop()!;
        if (token.value === '+') {
          stack.push(operand);
        } else if (token.value === '-') {
          stack.push(-operand);
        }
      } else {
        if (stack.length < 2) {
          throw new Error('Insufficient operands for binary operator');
        }
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
            if (b === 0) {
              throw new Error('Division by zero');
            }
            // Truncate toward zero
            const result = a / b;
            stack.push(result < 0 ? Math.ceil(result) : Math.floor(result));
            break;
        }
      }
    }
  }
  
  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }
  
  return stack[0];
}

const tokens = tokenize();
const rpn = shuntingYard(tokens);
const result = evaluateRPN(rpn);

console.log(result);
