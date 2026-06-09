type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
  isUnary: boolean; // for PLUS and MINUS
}
