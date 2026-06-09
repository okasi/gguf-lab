import * as fs from "fs";

interface Token {
  type: 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN';
  value: string | number;
  precedence: number;
  rightAssociative?: boolean;
  unary?: boolean;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let canBeUnary = true;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[0-9]/.test(char)) {
      let numStr = "";
      while (i < input.length && /[0-9]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: parseInt(numStr, 10), precedence: 0 });
      canBeUnary = false;
      continue;
    }

    if (char === '+') {
      tokens.push({
        type: 'OPERATOR',
        value: '+',
        precedence: canBeUnary ? 3 : 1,
        unary: canBeUnary,
        rightAssociative: canBeUnary
      });
      canBeUnary = true;
      i++;
    } else if (char === '-') {
      tokens.push({
        type: 'OPERATOR',
        value: '-',
        precedence: canBeUnary ? 3 : 1,
        unary: canBeUnary,
        rightAssociative: canBeUnary
      });
      canBeUnary = true;
      i++;
    } else if (char === '*') {
      tokens.push({ type: 'OPERATOR', value: '*', precedence: 2 });
      canBeUnary = false;
      i++;
    } else if (char === '/') {
      tokens.push({ type: 'OPERATOR', value: '/', precedence: 2 });
      canBeUnary = false;
      i++;
    } else if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', precedence: 0 });
      canBeUnary = true;
      i++;
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', precedence: 0 });
      canBeUnary = false;
      i++;
    } else {
      i++;
    }
  }
  return tokens;
}

function evaluate(tokens: Token[]): number {
  const values: number[] = [];
  const operators: Token[] = [];

  const applyOperator = () => {
    if (operators.length === 0) return;
    const op = operators.pop()!;
    if (op.unary) {
      if (values.length < 1) return;
      const val = values.pop()!;
      if (op.value === '+') values.push(val);
      else if (op.value === '-') values.push(-val);
    } else {
      if (values.length < 2) return;
      const right = values.pop()!;
      const left = values.pop()!;
      if (op.value === '+') values.push(left + right);
      else if (op.value === '-') values.push(left - right);
      else if (op.value === '*') values.push(left * right);
      else if (op.value === '/') {
        if (right === 0) {
          values.push(0);
        } else {
          values.push(Math.trunc(left / right));
        }
      }
    }
  };

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      values.push(token.value as number);
    } else if (token.type === 'LPAREN') {
      operators.push(token);
    } else if (token.type === 'RPAREN') {
      while (operators.length && operators[operators.length - 1].type !== 'LPAREN') {
        applyOperator();
      }
      operators.pop();
    } else if (token.type === 'OPERATOR') {
      while (
        operators.length &&
        operators[operators.length - 1].type !== 'LPAREN' &&
        (
          operators[operators.length - 1].precedence > token.precedence ||
          (operators[operators.length - 1].precedence === token.precedence && !token.rightAssociative)
        )
      ) {
        applyOperator();
      }
      operators.push(token);
    }
  }

  while (operators.length) {
    applyOperator();
  }

  return values[0];
}

const input = fs.readFileSync(0, "utf8");
if (input.trim()) {
  console.log(evaluate(tokenize(input)).toString());
}
