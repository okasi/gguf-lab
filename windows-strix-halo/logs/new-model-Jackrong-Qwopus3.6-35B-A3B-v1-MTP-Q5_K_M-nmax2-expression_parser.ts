import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

// Tokenize
type Token = { type: 'number'; value: number } | { type: 'op'; value: string };

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
      let num = 0;
      while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
        num = num * 10 + (expr[i] - '0');
        i++;
      }
      tokens.push({ type: 'number', value: num });
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      // Check if it's unary +/-
      // Unary + or - if:
      // 1. It's the first token
      // 2. The previous token is an operator (including opening parenthesis)
      const isUnary = ch === '+' || ch === '-';
      if (isUnary && (tokens.length === 0 || tokens[tokens.length - 1].type === 'op' || tokens[tokens.length - 1].type === 'paren' && (tokens[tokens.length - 1] as any).value === '(')) {
        tokens.push({ type: 'op', value: ch });
      } else {
        tokens.push({ type: 'op', value: ch });
      }
      i++;
    } else if (ch === '(') {
      tokens.push({ type: 'paren', value: '(' });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'paren', value: ')' });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

// Shunting-yard algorithm to convert to RPN
type RPNNode = RPNNumber | RPNOp;
type RPNNumber = { type: 'number'; value: number };
type RPNOp = { type: 'op'; value: string };

function toRPN(tokens: Token[]): RPNNode[] {
  const output: RPNNode[] = [];
  const ops: string[] = [];
  
  function precedence(op: string): number {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
  }
  
  for (const token of tokens) {
    if (token.type === 'number') {
      output.push({ type: 'number', value: token.value });
    } else if (token.type === 'op') {
      const op = token.value;
      while (ops.length > 0 && ops[ops.length - 1] !== '(' && precedence(ops[ops.length - 1]) >= precedence(op)) {
        output.push({ type: 'op', value: ops.pop()! });
      }
      ops.push(op);
    } else if (token.type === 'paren') {
      if ((token as any).value === '(') {
        ops.push('(');
      } else {
        while (ops.length > 0 && ops[ops.length - 1] !== '(') {
          output.push({ type: 'op', value: ops.pop()! });
        }
        ops.pop(); // Remove '('
      }
    }
  }
  
  while (ops.length > 0) {
    output.push({ type: 'op', value: ops.pop()! });
  }
  
  return output;
}

// Evaluate RPN
function evaluateRPN(rpn: RPNNode[]): number {
  const stack: number[] = [];
  
  for (const node of rpn) {
    if (node.type === 'number') {
      stack.push(node.value);
    } else {
      const op = node.value;
      const b = stack.pop()!;
      const a = stack.pop()!;
      
      if (op === '+') {
        stack.push(a + b);
      } else if (op === '-') {
        stack.push(a - b);
      } else if (op === '*') {
        stack.push(a * b);
      } else if (op === '/') {
        // Truncate toward zero
        const result = a / b;
        stack.push(Math.trunc(result));
      }
    }
  }
  
  return stack[0];
}

// Handle unary operators by inserting 0 before them
function insertZeroForUnary(tokens: Token[]): Token[] {
  const result: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'op' && (token.value === '+' || token.value === '-')) {
      // Check if unary
      const isUnary = i === 0 || 
                      tokens[i - 1].type === 'op' || 
                      (tokens[i - 1].type === 'paren' && (tokens[i - 1] as any).value === '(');
      if (isUnary) {
        result.push({ type: 'number', value: 0 });
      }
    }
    result.push(token);
  }
  return result;
}

const tokens = tokenize(input);
const tokensWithZero = insertZeroForUnary(tokens);
const rpn = toRPN(tokensWithZero);
const result = evaluateRPN(rpn);
console.log(result);
