import * as fs from 'fs';

const input = fs.readFileSync(0, 'utf8').trim();
let idx = 0;
const len = input.length;

function skipSpaces() {
  while (idx < len && input[idx] === ' ') idx++;
}

function parseNumber(): number {
  skipSpaces();
  let start = idx;
  while (idx < len && /[0-9]/.test(input[idx])) idx++;
  const numStr = input.slice(start, idx);
  return Number(numStr);
}

function parsePrimary(): number {
  skipSpaces();
  if (input[idx] === '(') {
    idx++; // consume '('
    const val = parseExpression();
    skipSpaces();
    if (input[idx] === ')') idx++; // consume ')'
    return val;
  } else {
    return parseNumber();
  }
}

function parseUnary(): number {
  skipSpaces();
  let sign = 1;
  while (input[idx] === '+' || input[idx] === '-') {
    if (input[idx] === '-') sign *= -1;
    idx++;
    skipSpaces();
  }
  const val = parsePrimary();
  return sign * val;
}

function parseFactor(): number {
  return parseUnary();
}

function parseTerm(): number {
  let val = parseFactor();
  while (true) {
    skipSpaces();
    if (input[idx] === '*') {
      idx++;
      const right = parseFactor();
      val = val * right;
    } else if (input[idx] === '/') {
      idx++;
      const right = parseFactor();
      val = Math.trunc(val / right);
    } else {
      break;
    }
  }
  return val;
}

function parseExpression(): number {
  let val = parseTerm();
  while (true) {
    skipSpaces();
    if (input[idx] === '+') {
      idx++;
      const right = parseTerm();
      val = val + right;
    } else if (input[idx] === '-') {
      idx++;
      const right = parseTerm();
      val = val - right;
    } else {
      break;
    }
  }
  return val;
}

const result = parseExpression();
console.log(result.toString());
