import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();

type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: number | null;
}

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
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }
    if (ch === '+') {
      tokens.push({ type: 'PLUS', value: null });
      i++;
      continue;
    }
    if (ch === '-') {
      tokens.push({ type: 'MINUS', value: null });
      i++;
      continue;
    }
    if (ch === '*') {
      tokens.push({ type: 'MULTIPLY', value: null });
      i++;
      continue;
    }
    if (ch === '/') {
      tokens.push({ type: 'DIVIDE', value: null });
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: null });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: null });
      i++;
      continue;
    }
    // Should not reach here
    i++;
  }
  return tokens;
}

function shuntingYard(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  
  const precedence = (type: TokenType, unary: boolean): number => {
    if (unary && (type === 'PLUS' || type === 'MINUS')) return 4;
    if (type === 'MULTIPLY' || type === 'DIVIDE') return 3;
    if (type === 'PLUS' || type === 'MINUS') return 2;
    return 0;
  };
  
  const isLeftAssociative = (type: TokenType): boolean => {
    return true; // All binary operators are left-associative
  };
  
  // We need to annotate tokens with whether +/- is unary
  // Let's do this during shunting-yard processing
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'NUMBER') {
      output.push(token);
    } else if (token.type === 'PLUS' || token.type === 'MINUS') {
      // Determine if unary
      const isUnary = (i === 0 || 
        tokens[i - 1].type === 'LPAREN' ||
        tokens[i - 1].type === 'PLUS' ||
        tokens[i - 1].type === 'MINUS' ||
        tokens[i - 1].type === 'MULTIPLY' ||
        tokens[i - 1].type === 'DIVIDE');
      
      // For unary, we'll just push to stack; they have higher precedence
      // For binary, we follow standard shunting-yard
      
      while (stack.length > 0 && 
             stack[stack.length - 1].type !== 'LPAREN') {
        const top = stack[stack.length - 1];
        const topIsUnary = /* need to track */ false; // This is tricky
        
        // Let me rethink this approach
      }
      
      stack.push(token);
    }
    // ...
  }
}
