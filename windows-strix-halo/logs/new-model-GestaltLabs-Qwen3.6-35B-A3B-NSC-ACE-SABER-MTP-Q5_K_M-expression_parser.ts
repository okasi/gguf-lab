type Token = { type: 'NUMBER'; value: number } | { type: 'PLUS' } | { type: 'MINUS' } | { type: 'STAR' } | { type: 'SLASH' } | { type: 'LPAREN' } | { type: 'RPAREN' } | { type: 'EOF' };

   function tokenize(expr: string): Token[] {
     const tokens: Token[] = [];
     let i = 0;
     const n = expr.length;
     while (i < n) {
       const ch = expr[i];
       if (ch === ' ') {
         i++;
         continue;
       }
       if (ch >= '0' && ch <= '9') {
         let num = 0;
         while (i < n && expr[i] >= '0' && expr[i] <= '9') {
           num = num * 10 + (expr[i].charCodeAt(0) - 48);
           i++;
         }
         tokens.push({ type: 'NUMBER', value: num });
         continue;
       }
       if (ch === '+') { tokens.push({ type: 'PLUS' }); i++; continue; }
       if (ch === '-') { tokens.push({ type: 'MINUS' }); i++; continue; }
       if (ch === '*') { tokens.push({ type: 'STAR' }); i++; continue; }
       if (ch === '/') { tokens.push({ type: 'SLASH' }); i++; continue; }
       if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
       if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
       // Should not happen based on problem statement, but skip or throw
       i++;
     }
     tokens.push({ type: 'EOF' });
     return tokens;
   }
