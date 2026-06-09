type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'MUL' | 'DIV' | 'LPAREN' | 'RPAREN' | 'EOF';
        interface Token {
            type: TokenType;
            value: string | number;
        }
