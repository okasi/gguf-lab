import * as fs from 'fs';

/**
 * Defines the types of tokens the lexer produces.
 */
type Token =
  | { type: 'NUMBER'; value: number; }
  | { type: 'OPERATOR'; value: string; }
  | { type: 'LPAREN'; value: '('; }
  | { type: 'RPAREN'; value: ')'; }
  | { type: 'END'; value: ''; }

/**
 * Defines operator precedence (higher number means higher precedence).
 * Unary is highest.
 */
const precedence = new Map<string, number>([
  ['UNARY_PLUS', 6],
  ['UNARY_MINUS', 6],
  ['STAR', 5],
  ['DIVIDE', 4],
  ['MINUS', 2],
  ['PLUS', 1],
]);

/**
 * Applies a binary operation to two operands.
 * Performs integer division truncating toward zero.
 * @param left The left operand.
 * @param right The right operand.
 * @param op The operator.
 * @returns The result of the operation.
 */
function applyOp( left: number, right: number, op: string): number {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      // Truncate toward zero behavior: Math.trunc handles this correctly
      return Math.trunc(left / right);
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

/**
 * Tokenizes the input string into a list of meaningful units.
 * @param input The string to tokenize.
 * @returns An array of Token objects.
 */
function tokenize( input: string): Token[] {
  // Regex matches numbers, whitespace, and operators/parentheses
  const tokens = input.match(/\d+|[+\-*/()]|\s+/g) || [];

  return tokens
    .filter(token => token.trim() !== '')
    .map(token => {
      const value = token.trim();
      if (!isNaN(Number(value))) {
        return { type: 'NUMBER'; value: Number(value); };
      }
      
      // Handle unary signs that might appear alone
      const isUnary = /^[+\-]$/.test(value);
      if (isUnary) {
        return { type: isUnary ? 'UNARY_PLUS' : 'UNARY_MINUS'; value: value; };
      }

      // Binary operators and parentheses
      const op = value.length === 1 ? value : value;
      return { type: 'OPERATOR'; value: op; };
    });
}

/**
 * Evaluates a list of tokens using recursive descent with operator precedence.
 * @param tokens The list of tokens.
 * @param index The current position in the token list.
 * @returns A tuple [value, nextIndex] representing the evaluated expression and the index of the next token.
 */
function parse( tokens: Token[], index: number): [number, number] {
  // Handles base case (number) or unary expressions
  if ( index >= tokens.length ) {
    throw new Error('Unexpected end of expression');
  }
  
  const token = tokens[ index ];

  if ( token. type === 'NUMBER' ) {
    return [ token. value, index + 1 ];
  }

  // Unary operators (must be at start or after '(' or another operation)
  const unaryPrecedence = precedence.get('UNARY_PLUS') || precedence.get('UNARY_MINUS')!;

  if ( token. type === 'OPERATOR' ) {
    const op = token. value;
    if ( precedence.get( op ) === unaryPrecedence ) {
      // Unary operator: consume it, then parse the rest.
      const opToken = token;
      const [ operand, nextIndex ] = parse( tokens, index + 1 );

      if ( opToken. value === '+' ) return [ operand + 0, nextIndex ];
      if ( opToken. value === '-' ) return [ operand * -1, nextIndex ];
    }
  }

  // Handle parentheses and recursive evaluation
  if ( token. type === 'LPAREN' ) {
    const [ subExpression, endOfParentheses ] = parse( tokens, index + 1 );

    if ( endOfParentheses !== index + 1 ) {
      return [ subExpression, endOfParentheses + 1 ];
    }
  }

  // Fallback to binary operator processing (left-associative)
  if ( token. type === 'OPERATOR' ) {
    const op = token. value;
    const currentPrecedence = precedence.get( op ) ?? 0;

    // Loop while current operator has equal or higher precedence
    while ( 
         index + 1 < tokens.length && 
         tokens[ index + 1 ]. type === 'OPERATOR' && 
         precedence.get( tokens[ index + 1 ]. value ) >= currentPrecedence
      ) {
         const rightToken = tokens[ index + 1 ];
        const right = parse( tokens, index + 1 )[ 1 ] ;

        // Evaluate left operand (which might be a parenthesized expression)
        const [ leftValue, leftIndex ] = parse( tokens, index + 1 );
        
        // Apply operator
         const result = applyOp( leftValue, right, opToken. value );

        // Move index past the entire expression just evaluated
         index = leftIndex;
         
        // Update opToken to the result for left-associativity
         opToken. value = String( result );
      }

      // After resolving all equal/higher precedence operators to the left, 
      // evaluate the current operator with the right operand.
      const [ leftValue, leftIndex ] = parse( tokens, index + 1 )[ 1 ] ;
      const right = parse( tokens, index + 1 )[ 1 ] ;

       return [ applyOp( leftValue, right, opToken. value ), index + 1 ];
  }

  throw new Error(`Unknown token type at index ${ index }: ${ token. type }`);
}

/**
 * Main function to read input, evaluate, and print result.
 */
function main() {
  try {
    // Read all data from stdin
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input) {
      return;
    }

    const tokens = tokenize( input );
    const [ result, finalIndex ] = parse( tokens, 0 );

    if ( finalIndex !== tokens.length ) {
      console.error(`Parsing finished unexpectedly at index ${ finalIndex }`);
    } else {
      console.log( result.toString() );
    }

  } catch ( e: any ) {
    console.error( e.message );
  }
}

main();
