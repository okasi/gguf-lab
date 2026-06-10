import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
let s = input;
let index = 0;

function skipSpaces(): void {
  while (index < s.length && s[index] === ' ') {
    index++;
  }
}

function parseNumber(): number {
  skipSpaces();
  let start = index;
  while (index < s.length && s[index] >= '0' && s[index] <= '9') {
    index++;
  }
  return Number(s.slice(start, index));
}

function truncDiv(a: number, b: number): number {
  return Math.trunc(a / b);
}

function parseFactor(): number {
  skipSpaces();
  const ch = s[index];
  if (ch === '(') {
    index++; // skip '('
    const val = parseExpression();
    skipSpaces();
    if (s[index] !== ')') {
      throw new Error('Expected )');
    }
    index++; // skip ')'
    return val;
  } else if (ch === '+' || ch === '-') {
    index++; // skip unary operator
    const val = parseFactor();
    return ch === '+' ? val : -val;
  } else {
    return parseNumber();
  }
}

function parseTerm(): number {
  let left = parseFactor();
  while (true) {
    skipSpaces();
    if (index < s.length && (s[index] === '*' || s[index] === '/')) {
      const op = s[index];
      index++;
      const right = parseFactor();
      if (op === '*') {
        left *= right;
      } else {
        left = truncDiv(left, right);
      }
    } else {
      break;
    }
  }
  return left;
}

function parseExpression(): number {
  let left = parseTerm();
  while (true) {
    skipSpaces();
    if (index < s.length && (s[index] === '+' || s[index] === '-')) {
      const op = s[index];
      index++;
      const right = parseTerm();
      if (op === '+') {
        left += right;
      } else {
        left -= right;
      }
    } else {
      break;
    }
  }
  return left;
}

const result = parseExpression();
console.log(result.toString());
