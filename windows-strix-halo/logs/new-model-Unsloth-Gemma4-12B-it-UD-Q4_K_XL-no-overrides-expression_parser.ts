type TokenType = "NUMBER" | "PLUS" | "MINUS" | "MUL" | "DIV" | "LPAREN" | "RPAREN" | "EOF";
    interface Token {
        type: TokenType;
        value: string | number;
    }

    function tokenize(input: string): Token[] {
        const tokens: Token[] = [];
         let i = 0;
         while (i < input.length) {
            const char = input[i];
             if (char === ' ') { i++; continue; }
             if (char === '+') { tokens.push({type: "PLUS", value: "+"}); i++; continue; }
             if (char === '-') { tokens.push({type: "MINUS", value: "-"}); i++; continue; }
             if (char === '*') { tokens.push({type: "MUL", value: "*"}); i++; continue; }
             if (char === '/') { tokens.push({type: "DIV", value: "/"}); i++; continue; }
             if (char === '(') { tokens.push({type: "LPAREN", value: "("}); i++; continue; }
             if (char === ')')) { tokens.push({type: "RPAREN", value: ")"}); i++; continue; }
             if (/\d/.test(char)) {
                 let num = "";
                 while (i < input.length && /[\d]/.test(input[i])) {
                    num += input[i];
                    i++;
                }
                 tokens.push({type: "NUMBER", value: parseInt(num)});
                 continue;
            }
             i++;
         }
         tokens.push({type: "EOF", value: ""});
         return tokens;
    }
