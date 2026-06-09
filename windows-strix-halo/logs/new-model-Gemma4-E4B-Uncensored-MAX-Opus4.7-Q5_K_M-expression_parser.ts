import * as fs from 'fs';

type Token =
  | { type: 'NUMBER'; value: number; }
  | { type: 'OPERATOR'; value: string; }
  | { type: 'PAREN'; value: string; }
  | { type: 'EOF'; }
  | { type: 'ERROR'; message: string; };

/**
 * Tokenizes the expression string.
 * Handles numbers, operators, parentheses, and whitespace.
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    let char = input[i];
    const isSpace = /\s/.test(char);

    if (isSpace) {
      i++;
      continue;
    }

    // Numbers
    if (/\d/.test(char)) {
      let numStr = '';
      while (i < input.length && /\d/.test(input[i]))) {
        numStr += input[i];
        i++;
      }
      const number = Number(numStr);
      tokens.push({ type: 'NUMBER'; value: number; });
      continue;
    }

    // Unary/Binary operators
    if (/[+\-*/]/.test(char)) {
      // Check if + or - is unary (at start, after open paren, or after another operator)
      const isUnary = tokens.length === 0 || 
                        tokens[tokens.length - 1].type === 'OPERATOR' || 
                        tokens.length > 0 && tokens[tokens.length - 1].type === 'PAREN' && tokens[tokens.length - 1].value === '(';

      const op = char;
      const operator = op === '+' ? 'U+' : op === '-' ? 'U-' : op;

      // Special case: unary operators are always pushed as a distinct token
      if (isUnary) {
        tokens.push({ type: 'UNARY'; value: operator; });
        i++;
        continue;
      }

      // Binary operators
      tokens.push({ type: 'OPERATOR'; value: op; });
      i++;
      continue;
    }

    // Parentheses
    if (char === '(' || char === ')') {
      tokens.push({ type: 'PAREN'; value: char; });
      i++;
      continue;
    }

    // Unknown character
    tokens.push({ type: 'ERROR'; message: `Unknown character: ${char}` });
    i++;
  }

  tokens.push({ type: 'EOF'; });
  return tokens;
}

/**
 * Determines the precedence of an operator. Higher numbers bind tighter.
 * Unary takes precedence over binary.
 */
function getPrecedence(token: Token): number {
  if (token.type === 'UNARY') return 6;
  if (token.type === 'OPERATOR') {
    return {
      '*': 5,
      '/': 5,
      '+': 2,
      '-': 2,
    }[token.value] ?? 0;
  }
  return 0; // Not an operator
}

/**
 * Performs arithmetic operation.
 * Handles integer division truncating toward zero.
 */
function applyOperator(op: string, left: number, right: number): number {
  switch (op) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/':
      // Integer division truncates toward zero (standard JS behavior for / is floor towards -Infinity, we need C-style truncation towards zero)
      return Math.trunc(left / right);
    case 'U+': return +left + right;
    case 'U-': return left - right;
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

/**
 * Pops the top operator and applies it to the top two operands.
 * Returns the result.
 */
function applyOp(opStack: number[], opPrecedence: number): number {
  const right = opStack.pop()!;
  const left = opStack.pop()!;

  if (opStack.length === 0) {
    throw new Error('Operator stack underflow: missing operand');
  }

  return applyOperator(opStack.pop()! as string, left, right);
}

/**
 * Parses and evaluates the expression using two stacks:
 * one for operands (numbers), one for operators.
 * Uses precedence climbing (shunting yard logic adapted for direct evaluation).
 */
function evaluate(tokens: Token[]): number {
  const opStack: number[] = [];
  const valueStack: number[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'NUMBER':
        valueStack.push(token.value);
        break;

      case 'UNARY':
        // Unary operators always take precedence and are pushed immediately
        opStack.push(token.value as string);
        break;

      case 'PAREN':
        if (token.value === '(') {
          opStack.push('(');
        } else {
          // Right parenthesis: evaluate until matching left parenthesis
          while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
            let precedence = getPrecedence(opStack.pop()!);
            if (typeof precedence === 'number') {
              valueStack.push(applyOperator(opStack[opStack.length - 1] as string, valueStack.pop()!, valueStack.pop()!));
            } else {
              throw new Error(`Unknown token: ${opStack.pop()?.value}`);
            }
          }
          const open = opStack.pop();
          if (!open || open !== '(') {
            throw new Error('Mismatched parenthesis: missing opening parenthesis');
          }
          // If the top is an unary operator, apply it now
          const unary = opStack[opStack.length - 1] as string;
          if (unary.startsWith('U')) {
              valueStack.push(applyOperator(unary, valueStack.pop()!));
              opStack.pop();
          } else {
             // Operator after opening parenthesis, apply it
            let precedence = getPrecedence(opStack.pop()!);
            if (typeof precedence === 'number') {
                valueStack.push(applyOperator(opStack.pop()! as string, valueStack.pop()!, valueStack.pop()!));
            } else {
              throw new Error(`Unknown token: ${opStack.pop()?.value}`);
            }
          }
        }
        break;

      case 'EOF':
        break;

      case 'ERROR':
        throw new Error(`Tokenization error: ${token.message}`);
    }
  }

  // After parsing, apply remaining operators
  while (opStack.length > 0) {
    let precedence = getPrecedence(opStack.pop()!);
    if (typeof precedence === 'number') {
      valueStack.push(applyOperator(opStack.pop()! as string, valueStack.pop()!, valueStack.pop()!));
    } else {
      throw new Error(`Unknown token in operator stack: ${opStack.pop()?.value}`);
    }
  }

  const result = valueStack.pop();
  if (typeof result !== 'number') {
    throw new Error('Expression evaluation failed: empty value stack');
  }
  return result;
}

// --- Main execution ---

try {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) {
    process.stdout.write('\n');
    process.exit(0);
  }
  
  const tokens = tokenize(input);
  const result = evaluate(tokens);
  
  process.stdout.write(String(result) + '\n');

} catch (e) {
  console.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
