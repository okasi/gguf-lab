type Token = 
        | { type: 'NUMBER', value: number }
        | { type: 'PLUS', value: string }
        | { type: 'MINUS', value: string }
        | { type: 'MUL', value: string }
        | { type: 'DIV', value: string }
        | { type: 'LPAREN', value: string }
        | { type: 'RPAREN', value: string };
