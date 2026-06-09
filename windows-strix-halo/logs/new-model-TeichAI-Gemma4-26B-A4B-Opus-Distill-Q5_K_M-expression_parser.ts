import * as fs from 'fs';

enum TokenType {
  Number,
  Plus,
  Minus,
  Mul,
  Div,
  LParen,
  RParen,
}

interface Token {
  type: TokenType;
  value?: number;
}

enum OpType {
  Binary,
  Unary,
}

interface TokenWithContext {
  token: Token;
  opType?: OpType;
}

const precedence: Record<string, number> = {
  'unary+': 3,
  'unary-': 3,
  '*': 2,
  '/': 2,
  '+': 1,
  '-': 1,
};

function getOpName(type: TokenType): string {
  switch (type) {
    case TokenType.Plus: return '+';
    case TokenType.Minus: return '-';
    case TokenType.Mul: return '*';
    case TokenType.Div: return '/';
    default: return '';
  }
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
      tokens.push({ type: TokenType.Number, value: parseInt(numStr, 10) });
      continue;
    }
    if (char === '+') {
      tokens.push({ type: TokenType.Plus });
      i++;
    } else if (char === '-') {
      tokens.push({ type: TokenType.Minus });
      i++;
    } else if (char === '*') {
      tokens.push({ type: TokenType.Mul });
      i++;
    } else if (char === '/') {
      tokens.push({ type: TokenType.Div });
      i++;
    } else if (char === '(') {
      tokens.push({ type: TokenType.LParen });
      i++;
    } else if (char === ')') {
      tokens.push({ type: TokenType.RParen });
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

function preprocessTokens(tokens: Token[]): TokenWithContext[] {
  const processed: TokenWithContext[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let opType: OpType | undefined = undefined;

    if (token.type === TokenType.Plus || token.type === TokenType.Minus) {
      const prev = i > 0 ? processed[i - 1] : null;
      const isUnary = !prev || (
        prev.token.type !== TokenType.Number &&
        prev.token.type !== TokenType.RParen
      );
      if (isUnary) opType = OpType.Unary;
    }

    processed.push({ token, opType });
  }
  return processed;
}

function shuntingYard(tokens: TokenWithContext[]): (TokenWithContext | number)[] {
  const output: (TokenWithContext | number)[] = [];
  const stack: TokenWithContext[] = [];

  for (const tokenCtx of tokens) {
    const { token, opType } = tokenCtx;

    if (token.type === TokenType.Number) {
      output.push(token.value!);
    } else if (token.type === TokenType.LParen) {
      stack.push(tokenCtx);
    } else if (token.type === TokenType.RParen) {
      while (stack.length > 0 && stack[stack.length - 1].token.type !== TokenType.LParen) {
        output.push(stack.pop()!);
      }
      stack.pop();
    } else {
      const opName = opType === OpType.Unary ? `unary${getOpName(token.type)}` : getOpName(token.type);
      const prec = precedence[opName] || 0;

      while (stack.length > 0 && stack[stack.length - 1].token.type !== TokenType.LParen) {
        const top = stack[stack.length - 1];
        const topOpName = top.opType === OpType.Unary ? `unary${getOpName(top.token.type)}` : getOpName(top.token.type);
        const topPrec = precedence[topOpName] || 0;

        if ((opType === OpType.Unary && prec <= topPrec) || (opType === OpType.Binary && prec < topPrec)) {
          output.push(stack.pop()!);
        } else {
          break;
        }
      }
      stack.push(tokenCtx);
    }
  }

  while (stack.length > 0) {
    output.push(stack.pop()!);
  }

  return output;
}

function evaluatePostfix(postfix: (TokenWithContext | number)[]): number {
  const stack: number[] = [];

  for (const token of postfix) {
    if (typeof token === 'number') {
      stack.push(token);
    } else {
      const { token: t, opType } = token;
      if (opType === OpType.Unary) {
        const operand = stack.pop()!;
        if (t.type === TokenType.Plus) {
          stack.push(operand);
        } else if (t.type === TokenType.Minus) {
          stack.push(-operand);
        }
      } else {
        const right = stack.pop()!;
        const left = stack.pop()!;
        switch (t.type) {
          case TokenType.Plus: stack.push(left + right); break;
          case TokenType.Minus: stack.push(left - right); break;
          case TokenType.Mul: stack.push(left * right); break;
          case TokenType.Div: stack.push(Math.trunc(left / right)); break;
        }
      }
    }
  }

  return stack[0];
}

function main() {
  try {
    const input = fs.readFileSync(0, "utf8");
    if (!input.trim()) return;
    const tokens = tokenize(input.trim());
    const processedTokens = preprocessTokens(tokens);
    const postfix = shuntingYard(processedTokens);
    const result = evaluatePostfix(postfix);
    process.stdout.write(result.toString() + "\n");
  } catch (err) {}
}

main();
