const fs = require('fs');

/**
 * Token types
 */
type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'MUL' | 'DIV' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/\d/.test(char)) {
      let numStr = '';
      while (i < input.length && /\d/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    if (char === '+') tokens.push({ type: 'PLUS', value: '+' });
    else if (char === '-') tokens.push({ type: 'MINUS', value: '-' });
    else if (char === '*') tokens.push({ type: 'MUL', value: '*' });
    else if (char === '/') tokens.push({ type: 'DIV', value: '/' });
    else if (char === '(') tokens.push({ type: 'LPAREN', value: '(' });
    else if (char === ')') tokens.push({ type: 'RPAREN', value: ')' });
    
    i++;
  }

  return tokens;
}

function evaluate(input: string): number {
  const tokens = tokenize(input);
  
  // Pre-process to handle unary operators
  // A minus or plus is unary if it's at the start or follows an operator/opening paren
  const processedTokens: (Token | { type: 'UNARY', value: string })[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'MINUS' || token.type === 'PLUS') {
      if (i === 0 || tokens[i - 1].type === 'MINUS' || 
          tokens[i - 1].type === 'PLUS' || 
          tokens[i - 1].type === 'MUL' || 
          tokens[i - 1].type === 'DIV' || 
          tokens[i - 1].type === 'LPAREN') {
        processedTokens.push({ type: 'UNARY', value: token.value });
        continue;
      }
    }
    processedTokens.push(token);
  }

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    'UNARY': 3
  };

  const outputQueue: (Token | { type: 'UNARY', value: string })[] = [];
  const operatorStack: (Token | { type: 'UNARY', value: string })[] = [];

  for (const token of processedTokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.pop();
    } else {
      const currentPrec = token.type === 'UNARY' ? precedence['UNARY'] : precedence[token.value];
      while (operatorStack.length && 
             operatorStack[operatorStack.length - 1].type !== 'LPAREN' &&
             (operatorStack[operatorStack.length - 1].type === 'UNARY' ? precedence['UNARY'] : precedence[operatorStack[operatorStack.length - 1].value]) >= currentPrec) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    }
  }

  while (operatorStack.length) {
    outputQueue.push(operatorStack.pop()!);
  }

  // Evaluation using RPN
  const stack: number[] = [];
  for (const token of outputQueue) {
    if (token.type === 'NUMBER') {
      stack.push(parseInt(token.value, 10));
    } else if (token.type === 'UNARY') {
      const a = stack.pop()!;
      stack.push(token.value === '-' ? -a : a);
    } else {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token.type) {
        case 'PLUS': stack.push(a + b); break;
        case 'MINUS': stack.push(a - b); break;
        case 'MUL': stack.push(a * b); break;
        case 'DIV': 
          const res = a / b;
          stack.push(res < 0 ? Math.ceil(res) : Math.floor(res));
          break;
      }
    }
  }

  return stack[0];
}

const input = fs.readFileSync(0, "utf8").trim();
if (input) {
  console.log(evaluate(input));
}
