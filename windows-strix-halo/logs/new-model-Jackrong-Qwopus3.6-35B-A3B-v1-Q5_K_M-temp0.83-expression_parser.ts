type Token = 
            | { type: 'number', value: number }
            | { type: 'operator', op: '+' | '-' | '*' | '/', unary: boolean }
            | { type: 'paren', value: '(' | ')' }

        Precedence for operators:

          function getPrecedence(op: Token): number {
            if (op.type === 'operator' && op.unary) return 3;
            if (op.type === 'operator' && (op.op === '*' || op.op === '/')) return 2;
            if (op.type === 'operator' && (op.op === '+' || op.op === '-')) return 1;
            return 0; // for parenthesis, but we don't use precedence for parenthesis in the condition
          }

        But note: we only compare precedence for operators. For parenthesis, we handle separately.

        In the shunting-yard, we check if the top of the stack is an operator (not parenthesis) when comparing precedence.

        Let's code accordingly.

        However, note: the unary operator condition in the while loop: 
          while (stack.length > 0 && stack[stack.length-1].type === 'operator' && 
                 stack[stack.length-1].type === 'operator' && 
                 ( (token.unary && getPrecedence(stack[stack.length-1]) > getPrecedence(token)) ||
                   (!token.unary && getPrecedence(stack[stack.length-1]) >= getPrecedence(token)) ))

        But wait: the
