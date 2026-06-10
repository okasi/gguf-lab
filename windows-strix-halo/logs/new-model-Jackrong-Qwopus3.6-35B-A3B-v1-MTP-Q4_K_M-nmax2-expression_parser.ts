import * as fs from 'fs';

const input = fs.readFileSync(0, "utf8").trim();

// Tokenizer: split expression into numbers and operators
type Token = { type: 'num'; value: number } | { type: 'op'; value: string };

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
        num = num * 10 + (expr[i] - 0);
        i++;
      }
      tokens.push({ type: 'num', value: num });
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

// Shunting-yard algorithm to convert infix to postfix
function toPostfix(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const ops: string[] = [];
  
  const precedence: { [op: string]: number } = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };
  
  const isLeftAssociative: { [op: string]: boolean } = {
    '+': true,
    '-': true,
    '*': true,
    '/': true,
  };
  
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    
    if (token.type === 'num') {
      output.push(token);
    } else if (token.value === '(') {
      ops.push(token.value);
    } else if (token.value === ')') {
      while (ops.length > 0 && ops[ops.length - 1] !== '(') {
        output.push({ type: 'op', value: ops.pop()! });
      }
      if (ops.length > 0 && ops[ops.length - 1] === '(') {
        ops.pop();
      }
    } else if (token.value === '+' || token.value === '-') {
      // Handle unary +/- by converting to a special token
      // Check if it's unary: first token, after '(', or after another operator
      const isUnary = i === 0 || 
        tokens[i - 1].type === 'op' && tokens[i - 1].value === '(' ||
        tokens[i - 1].type === 'op' && (tokens[i - 1].value === '+' || tokens[i - 1].value === '-');
      
      if (isUnary) {
        // Treat unary +/- as part of the number or as a special unary operator
        // We'll handle it by adjusting the next number's sign
        let sign = 1;
        if (token.value === '-') {
          sign = -1;
        }
        // Look for the next number
        let j = i + 1;
        while (j < tokens.length && tokens[j].type === 'num') {
          i = j + 1;
          break;
        }
        // Actually, let's just push a unary operator token and handle it later
        // Better approach: use a unary operator token type
        // Let's modify our approach: we'll add unary operators as special tokens
        output.push({ type: 'op', value: 'u' + token.value });
        i++;
        // Skip the next number if it's unary... actually this is getting complicated
        // Let's use a different approach: just push unary operators and handle in evaluation
        i++;
      } else {
        while (ops.length > 0 && ops[ops.length - 1] !== '(' && precedence[ops[ops.length - 1]!] >= precedence[token.value]) {
          output.push({ type: 'op', value: ops.pop()! });
        }
        ops.push(token.value);
        i++;
      }
    } else if (token.value === '*' || token.value === '/') {
      while (ops.length > 0 && ops[ops.length - 1] !== '(' && precedence[ops[ops.length - 1]!] >= precedence[token.value]) {
        output.push({ type: 'op', value: ops.pop()! });
      }
      ops.push(token.value);
      i++;
    } else {
      i++;
    }
  }
  
  while (ops.length > 0) {
    output.push({ type: 'op', value: ops.pop()! });
  }
  
  return output;
}

// Evaluate postfix expression
function evaluatePostfix(tokens: Token[]): number {
  const stack: number[] = [];
  
  for (const token of tokens) {
    if (token.type === 'num') {
      stack.push(token.value);
    } else if (token.type === 'op') {
      if (token.value.startsWith('u')) {
        // Unary operator
        const sign = token.value === 'u+' ? 1 : -1;
        const val = stack.pop()!;
        stack.push(val * sign);
      } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/': stack.push(a / b | 0); break; // Truncate toward zero
        }
      }
    }
  }
  
  return stack.pop()!;
}

// Main: re-tokenize with proper handling of unary operators
function tokenizeWithUnary(expr: string): Token[] {
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
        num = num * 10 + (expr[i] - 0);
        i++;
      }
      tokens.push({ type: 'num', value: num });
    } else if (ch === '+' || ch === '-') {
      // Check if unary
      const isUnary = tokens.length === 0 || 
        (tokens[tokens.length - 1].type === 'op' && tokens[tokens.length - 1].value !== ')') ||
        (tokens[tokens.length - 1].type === 'op' && tokens[tokens.length - 1].value === '(');
      
      if (isUnary) {
        let sign = 1;
        if (ch === '-') sign = -1;
        
        // Try to consume the next number with sign
        let j = i + 1;
        let consumed = false;
        if (j < expr.length && expr[j] >= '0' && expr[j] <= '9') {
          let num = 0;
          while (j < expr.length && expr[j] >= '0' && expr[j] <= '9') {
            num = num * 10 + (expr[j] - 0);
            j++;
          }
          tokens.push({ type: 'num', value: num * sign });
          i = j;
          consumed = true;
        }
        
        if (!consumed) {
          // It's a unary operator, we'll handle it in evaluation
          tokens.push({ type: 'op', value: 'u' + ch });
          i++;
        }
      } else {
        tokens.push({ type: 'op', value: ch });
        i++;
      }
    } else if (ch === '*' || ch === '/') {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else if (ch === '(') {
      tokens.push({ type: 'op', value: '(' });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'op', value: ')' });
      i++;
    } else {
      i++;
    }
  }
  
  return tokens;
}

// Evaluate the expression
const tokens = tokenizeWithUnary(input);
const postfix = toPostfix(tokens);
const result = evaluatePostfix(postfix);

console.log(result);
