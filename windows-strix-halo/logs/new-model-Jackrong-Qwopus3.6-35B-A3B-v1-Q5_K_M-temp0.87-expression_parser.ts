type Token = 
          | { type: 'number', value: number }
          | { type: 'operator', op: string, isUnary: boolean }
          | { type: 'leftParen' }
          | { type: 'rightParen' }

  - But note: the problem says "binary + - * /" and "unary + / -". So the unary ones are only + and -.

  - We can do:
      - When we see a '+' or '-' and it is at the beginning of the token list, or the previous token is an operator (binary), or the previous token is '(', then it is unary.
      - Otherwise, it is binary.

  - However, note: what about consecutive operators? For example: "3 - - 5". The second '-' is unary.

  - Also, what about: "3 + +5"? The second '+' is unary.

  - We must be cautious: the unary operator applies to the immediately following number.

 Implementation:

  Tokenization:
    - We'll split the string by spaces? But note: the problem says "spaces" are allowed. We can remove spaces first? 
      Actually, we can remove spaces and then parse. But note: numbers might be multi-digit. So we cannot simply split by space.

  Steps for tokenization:
    - Remove all spaces.
    - Then traverse the string and form tokens.

  How to form tokens?
    - We traverse the string and when we see a digit, we take all consecutive digits to form a number.
    - When we see an operator, we take one character (since operators are single: +, -, *, /).
    - Parentheses: '(' and ')'

  Then, after tokenizing, we adjust for unary operators.

  Let's define the token structure:

    interface Token {
      type: 'number' | 'operator' | 'leftParen' | 'rightParen';
      value?: number | string;
    }

    For number: type='number', value=number
    For operator: type='operator', value= the operator string, and we add a field 'isUnary' (boolean) to mark if unary.
    For parentheses: type='leftParen' or 'rightParen'

  Steps to mark unary:
    - We'll create a new token list.
    - We traverse the original token list (without parentheses, we only mark operators) and set isUnary to true if:
        * The token is at the beginning (index 0) and is a '+' or '-'
        * The previous token is an operator (and the current operator is '+' or '-')
        * The previous token is a leftParen and the current operator is '+' or '-'

    But note: what about the case after an operator? For example: "3 - - 5" -> tokens: [3, '-', '-', 5]
        - The first '-' is binary (because it comes after a number)
        - The second '-' is unary (because it comes after an operator)

    However, what about: "3 + - 5" -> same: the '-' is unary.

    Also, what about: "(-5)" -> tokens: ['(', '-', 5] -> the '-' is unary because it comes after '('.

    But note: what about: "3 + ( -5 )" -> the '-' is unary.

    So the rule: 
        isUnary = true if:
            - The token is the first token and is '+' or '-'
            - OR the previous token is an operator (any operator: including parentheses? no, parentheses are not operators in the same sense) -> actually, we consider:
                * Previous token is an operator (binary) -> then current is unary? 
                * Previous token is a leftParen -> then current is unary.

        However, note: after a rightParen, the next operator is binary? For example: "(3) + 5" -> the '+' after ')' is binary.

        So: 
            isUnary = (index === 0) || (previousToken.type === 'operator' && (currentToken.value === '+' || currentToken.value === '-')) 
                     || (previousToken.type === 'leftParen' && (currentToken.value === '+' || currentToken.value === '-'))

        But wait: what about after a rightParen? We don't mark as unary. So we only mark if the previous token is an operator (but note: the previous token might be a unary operator? but that doesn't matter: we are marking the current token as unary if it is preceded by an operator (any operator) or by '('.

        However, note: the previous token might be a unary operator? For example: "3 + + -5". The first '+' is binary? Actually, no: 
            tokens: [3, '+', '+', '-', 5]
            - The first '+' is binary? But wait, after 3 we have a '+', which is binary. Then we have another '+', which is unary? 
            - Then we have a '-', which is also unary? 

        Actually, the rule: 
            The first '+' after 3 is binary? But then the next '+' is unary because it comes after an operator? 
            Then the '-' is also unary because it comes after an operator? 

        However, the expression "3 + + -5" is: 3 + (+(-5)) -> which is 3 + (-5) = -2.

        So the rule: 
            isUnary = (index === 0) || 
                      (previousToken.type === 'operator' && (currentToken.value === '+' || currentToken.value === '-')) || 
                      (previousToken.type === 'leftParen' && (currentToken.value === '+' || currentToken.value === '-'))

        But note: what about after a rightParen? We don't mark as unary. So if we have "(3) - 5", the '-' is binary.

        However, what about: "(3) - -5"? 
            tokens: [ '(', 3, ')', '-', '-', 5 ]
            - The first '-' is binary (because it comes after a rightParen) -> so isUnary=false.
            - The second '-' is unary (because it comes after an operator) -> isUnary=true.

        So the rule holds.

  But note: what about the case: "3 + - -5"?
        tokens: [3, '+', '-', '-', 5]
        - The first '-' (after '+') is unary: isUnary=true.
        - The second '-' (after the first '-') is also unary: isUnary=true.

        So: 3 + (-(-5)) = 3 + 5 = 8.

  So the rule: 
      We mark a '+' or '-' as unary if:
          - It is the first token, OR
          - The previous token is an operator (of any type: including unary) OR the previous token is '(', OR
          - The previous token is a rightParen? -> no, because after a rightParen we have a binary operator.

        Actually, the rule: 
            isUnary = (index === 0) || 
                      (previousToken.type === 'operator' && (currentToken.value === '+' || currentToken.value === '-')) || 
                      (previousToken.type === 'leftParen' && (currentToken.value === '+' || currentToken.value === '-'))

        But note: the previousToken.type might be 'operator' even if it is unary? Yes, but we are marking the current token as unary if it is preceded by an operator (any operator) or by '('.

        However, what about: "3 + -5"? 
            tokens: [3, '+', '-', 5]
            - The '+' is binary? But wait, the previous token for the '-' is the '+', which is an operator -> so the '-' is unary.

        But the '+' is binary? Actually, the '+' is after a number (3) so it is binary. So the rule for the '+' token: 
            index=1, previous token is a number -> not an operator and not leftParen -> so the '+' is binary.

        Then the next token (the '-') is after an operator (the '+') -> so it is unary.

        So the rule is consistent.

  However, note: what about after a rightParen? For example: "(3) + 5" -> the '+' is after a rightParen. 
        The previous token for the '+' is a rightParen -> which is not an operator and not a leftParen -> so the '+' is binary.

        And (3) - -5: 
            tokens: [ '(', 3, ')', '-', '-', 5 ]
            - The first '-' is after a rightParen -> so it is binary.
            - The second '-' is after an operator (the first '-') -> so it is unary.

  So the rule is:

      function isUnaryOperator(index: number, tokens: Token[]): boolean {
          if (index === 0) return true;
          const prev = tokens[index-1];
          // If the previous token is a leftParen, then it's unary.
          if (prev.type === 'leftParen') return true;
          // If the previous token is an operator (any operator) and the current token is a '+' or '-', then it's unary.
          if (prev.type === 'operator' && (tokens[index].value === '+' || tokens[index].value === '-')) return true;
          // Otherwise, it's binary.
          return false;
      }

  But note: what about after a rightParen? We don't mark as unary. So we are safe.

  However, what about: "3 + - 5" -> the '-' is unary because the previous token is the '+' (which is an operator). 

  But what about: "3 + - - 5" -> 
      tokens: [3, '+', '-', '-', 5]
      - The first '-' (index=2): previous token is '+' (operator) -> unary.
      - The second '-' (index=3): previous token is '-' (operator) -> unary.

  So it works.

  Now, we need to represent the tokens with the isUnary flag.

  We can define:

    interface Token {
      type: 'number' | 'operator' | 'leftParen' | 'rightParen';
      value?: number | string;
      isUnary?: boolean;   // only for operators, and only if type is 'operator'
    }

  Then, when we tokenize, we create tokens and then adjust the isUnary for the operators that are '+' or '-'.

  Steps for tokenization:

    1. Remove spaces from the input string.
    2. Traverse the string and form tokens:
        - If we see a digit, we take all consecutive digits to form a number token.
        - If we see an operator (+, -, *, /) or parenthesis, we take one character and form a token.

    3. Then, for each token that is an operator and is '+' or '-', we set isUnary according to the rule above.

  Now, we have the tokens with isUnary flags.

  Next, we convert to postfix (RPN) using shunting-yard algorithm.

  We need to define:
    - Precedence and associativity for operators.

    We have:
      - Unary operators: precedence: highest (say 4) and right-associative.
      - Multiplicative operators (*, /): precedence 3, left-associative.
      - Additive operators (+, -): precedence 2, left-associative.

    But note: the unary operators are right-associative. So when we have:
        3 + - -5
        becomes: 3 + (-(-5)) -> so the unary minus applies to 5 first, then the next unary minus applies to the result.

    How does the shunting-yard handle right-associative operators?
        - When we have a right-associative operator, we pop operators from the stack only if the new operator has strictly greater precedence.

    However, note: the unary operators are different from binary. We must handle them in the shunting-yard.

    We can treat unary operators as having higher precedence and being right-associative.

    Steps for shunting-yard:

      Let outputQueue = [];
      Let operatorStack = [];

      For each token in the token list:
        - If the token is a number, push to outputQueue.
        - If the token is an operator:
            * While there is an operator at the top of the operatorStack and:
                - (it is not a leftParen) and 
                - (if the operator is right-associative, then while its precedence is greater than the current operator's precedence) 
                - (if the operator is left-associative, then while its precedence is greater than or equal to the current operator's precedence)
                then pop the operator from the stack to the outputQueue.
            * Then push the current operator to the stack.

        - If the token is a leftParen, push to the stack.
        - If the token is a rightParen:
            * While the top of the stack is not a leftParen, pop the operator to the outputQueue.
            * If there is no leftParen, then there is a mismatch.
            * Pop the leftParen from the stack and discard it.

      After processing all tokens, pop all operators from the stack to the outputQueue.

    However, note: the unary operators are right-associative. So we must set their associativity to right.

    But wait: the problem says unary operators are right-associative? Actually, the problem doesn't specify, but by convention, unary operators are right-associative.

    However, let's test with: 3 + - -5
        We want: 3, 5, -, -
        So the first unary minus (for -5) should be pushed first, then the second unary minus (for -(-5)) should be pushed after? 

        Actually, the expression: 3 + - -5
        Steps:
          - 3: output
          - '+': push to stack (precedence 2, left)
          - '-': unary, precedence 4 (right-associative) -> so we check the stack: top is '+' (prec 2) -> 2 < 4 -> so we don't pop? 
            But note: the rule for right-associative: we pop while the operator on the stack has precedence greater than the current? 
            Actually, the rule for right-associative: we pop while the operator on the stack has precedence greater than the current? 
            But the current has higher precedence (4 > 2) so we don't pop? Then we push the unary minus.

          - Then we have another unary minus: 
            current: unary minus (prec 4, right-associative)
            stack: [ '+', '-' ] (the '-' is unary)
            Now, we compare the current unary minus (prec 4) with the top of stack (unary minus, prec 4). 
            Since the current operator has the same precedence and is right-associative, we don't pop? 
            But wait: the rule for right-associative: we pop only if the operator on the stack has precedence strictly greater than the current? 
            Actually, the rule for right-associative: we pop while the operator on the stack has precedence greater than or equal to the current? 
            No, that would be for left-associative. 

            The standard rule for right-associative: we pop while the operator on the stack has precedence greater than the current? 
            But note: the current has the same precedence. 

            Actually, the rule for right-associative: we do not pop when the precedence is equal? 

            However, let me recall: 
                For left-associative: pop while (precedence of stack operator >= current)
                For right-associative: pop while (precedence of stack operator > current)

            So for the second unary minus: 
                current precedence = 4, stack top precedence = 4 -> 4 is not greater than 4 -> so we don't pop? 
                Then we push the current unary minus.

            Then we have 5: output.

            Then we finish: pop the stack: first the second unary minus, then the first unary minus, then the '+'.

            So output: 3, 5, -, -
            Then evaluation: 
                5 -> push
                - -> pop 5, push -5
                - -> pop -5, push 5
                + -> pop 5 and 3, push 3+5=8.

            So it works.

        But what about: 3 - -5?
            tokens: [3, '-', '-', 5]
            - 3: output
            - '-': unary? Actually, the first '-' is unary? Because it comes after a number? 
                But wait: the first '-' in "3 - -5" is binary? Because it comes after a number? 
                However, our tokenization: 
                    The first '-' is after the number 3 -> so it is binary? 
                But our rule: 
                    index=1, previous token is a number -> not an operator and not leftParen -> so the first '-' is binary.

            So tokens: [3, {type:'operator', value:'-', isUnary:false}, {type:'operator', value:'-', isUnary:true}, 5]

            Now, shunting-yard:
              - 3: output
              - binary '-': push to stack (prec 2, left)
              - unary '-': prec 4, right-associative -> compare with stack top (binary '-', prec 2) -> 2 < 4 -> so we don't pop? 
                Then push the unary minus.
              - 5: output
              - End: pop stack: first unary minus, then binary minus.
                Output: 3, 5, -, -
                Then evaluation: 
                    5 -> push
                    - (unary) -> pop 5, push -5
                    - (binary) -> pop -5 and 3, push 3 - (-5) = 8.

            But wait: the expression "3 - -5" is 3 - (-5) = 8. So it works.

        However, what about: 3 - 5? 
            tokens: [3, {type:'operator', value:'-', isUnary:false}, 5]
            - 3: output
            - binary '-': push to stack (prec 2, left)
            - 5: output
            - End: pop stack: binary '-' -> output: 3, 5, -
            Then evaluation: 3, 5, - -> 3-5 = -2.

        So it works.

    But note: the unary operator has higher precedence than binary operators. So when we have:
        3 * -4
        tokens: [3, {type:'operator', value:'*', isUnary:false}, {type:'operator', value:'-', isUnary:true}, 4]
        - 3: output
        - '*': push (prec 3, left)
        - unary '-': prec 4 -> compare with stack top ('*', prec 3): 3 < 4 -> so we don't pop? 
          Then push the unary minus.
        - 4: output
        - End: pop: unary minus, then '*' -> output: 3, 4, -, *
        Evaluation: 
            4 -> push
            - (unary) -> pop 4, push -4
            * -> pop -4 and 3, push 3 * (-4) = -12.

        But the expression "3 * -4" is 3 * (-4) = -12. So it works.

    However, what about: 3 * 4 - 5?
        tokens: [3, {type:'operator', value:'*', isUnary:false}, 4, {type:'operator', value:'-', isUnary:false}, 5]
        - 3: output
        - '*': push (prec 3, left)
        - 4: output
        - '-': binary, prec 2 -> compare with stack top ('*', prec 3): 3 >= 2 -> so pop '*' -> output: 3,4,*
                then push '-'
        - 5: output
        - End: pop '-' -> output: 3,4,*,5,-
        Evaluation: 
            3,4,* -> 12
            12,5,- -> 7.

        Correct.

    So the plan is:

      Step 1: Tokenize the expression (without spaces) into tokens, and mark unary operators for '+' and '-'.

      Step 2: Convert to postfix (RPN) using shunting-yard with:
          Precedence:
            - Unary +/- : 4 (right-associative)
            - * / : 3 (left-associative)
            - + - (binary) : 2 (left-associative)

      Step 3: Evaluate the RPN expression.

    Note: In the RPN evaluation, we need to handle unary operators. 
        - When we see a unary operator, we pop one operand and apply the unary operator to it.
        - When we see a binary operator, we pop two operands and apply the binary operator.

    But note: the unary operators are only + and -.

    Evaluation steps:

      Let stack = [];
      For each token in the RPN output:
        - If the token is a number, push to stack.
        - If the token is an operator:
            * If it is a unary operator: 
                - Pop one value from the stack, apply the unary operator, and push the result.
            * If it is a binary operator:
                - Pop two values from the stack (the first pop is the second operand, the second pop is the first operand), apply the operator, and push the result.

    However, note: the unary operator is right-associative, so we only need one operand.

    Example: 3, 5, -, - 
        - 3: push
        - 5: push
        - unary '-': pop 5, push -5
        - unary '-': pop -5, push 5
        - Then we have 3 and 5, and then a binary operator? Actually, we have to push the binary operator? 

    But wait: our RPN for "3 - -5" was: 3, 5, -, -
        - The first '-' is unary? Actually, in the RPN we have two unary minuses? 
        But note: the first '-' in the RPN is the binary minus? No, we have:

        Actually, the RPN for "3 - -5" is: 3, 5, -, -
        But the two minuses: the first one (which is the binary minus) is applied last? 

        How do we distinguish? We don't need to: because the unary operator takes one operand and the binary takes two.

        Steps:
          - 3: push [3]
          - 5: push [3,5]
          - unary '-': pop 5, push -5 -> [3, -5]
          - binary '-': pop -5 and 3, then compute 3 - (-5) = 8 -> push 8.

        But wait: the RPN we generated for "3 - -5" was: 3, 5, -, - 
        But the two minuses: the first one we generated was the binary minus? Then the second one was unary? 
        Actually, no: in the shunting-yard, we generated:
            - The binary minus was pushed first, then the unary minus? 
            But then when popping the stack at the end, we popped the unary minus first and then the binary minus? 
            So the RPN output: 
                - 3: output
                - 5: output
                - unary minus: output
                - binary minus: output
            So the RPN is: 3, 5, unary_minus, binary_minus.

        But when we evaluate, we process:
            - 3: push
            - 5: push
            - unary_minus: pop 5, push -5 -> now stack: [3, -5]
            - binary_minus: pop -5 and 3, compute 3 - (-5) = 8.

        So it works.

    However, note: the RPN order: 
        The binary operator comes after the unary operator in the RPN? 
        But the unary operator is applied first? 

        Actually, the RPN: 
            We have: 3, 5, unary_minus, binary_minus
            The unary_minus is applied to 5 first, then the binary_minus is applied to 3 and the result of unary_minus.

        This is correct.

    But what about: 3 + -5?
        tokens: [3, {type:'operator', value:'+', isUnary:false}, {type:'operator', value:'-', isUnary:true}, 5]
        shunting-yard:
          - 3: output
          - '+': push (prec 2, left)
          - unary '-': prec 4 -> compare with stack top ('+', prec 2): 2 < 4 -> don't pop, push unary minus.
          - 5: output
          - End: pop unary minus, then '+'
          RPN: 3, 5, unary_minus, +
        Evaluation:
          - 3: push
          - 5: push
          - unary_minus: pop 5, push -5 -> [3, -5]
          - '+': pop -5 and 3, compute 3 + (-5) = -2.

        Correct.

    So the evaluation step:

      function evaluate(tokens: Token[]): number {
          let stack: number[] = [];
          for (const token of tokens) {
              if (token.type === 'number') {
                  stack.push(token.value);
              } else if (token.type === 'operator') {
                  if (token.isUnary) {
                      // Pop one operand
                      const a = stack.pop();
                      if (a === undefined) {
                          throw new Error("Invalid expression");
                      }
                      let result: number;
                      if (token.value === '+') {
                          result = a;
                      } else if (token.value === '-') {
                          result = -a;
                      }
                      stack.push(result);
                  } else {
                      // Binary operator: pop two operands
                      const b = stack.pop();
                      const a = stack.pop();
                      if (a === undefined || b === undefined) {
                          throw new Error("Invalid expression");
                      }
                      let result: number;
                      if (token.value === '+') {
                          result = a + b;
                      } else if (token.value === '-') {
                          result = a - b;
                      } else if (token.value === '*') {
                          result = a * b;
                      } else if (token.value === '/') {
                          // Truncates toward zero: use Math.trunc or |0? 
                          // Since the problem says "truncates toward zero", and the numbers are integers, we can use Math.trunc(a/b)
                          result = Math.trunc(a / b);
                      }
                      stack.push(result);
                  }
              }
              // Ignore parentheses in RPN (they are already processed in shunting-yard)
          }
          return stack[0];
      }

    Now, we need to implement the shunting-yard.

    Steps for shunting-yard:

      function toPostfix(tokens: Token[]): Token[] {
          let outputQueue: Token[] = [];
          let operatorStack: Token[] = [];

          // Precedence: 
          const precedence: Record<string, number> = {
              '+': 2,
              '-': 2,   // but note: for unary we use 4, but we will use the isUnary flag to decide the precedence? 
              '*': 3,
              '/': 3
          };

          // But wait: for unary operators, we want precedence 4. So we cannot use the same key for both unary and binary? 
          // We can define a function that returns the precedence for a token.

          const getPrecedence = (token: Token): number => {
              if (token.type !== 'operator') {
                  throw new Error("Invalid token");
              }
              if (token.isUnary) {
                  return 4;
              }
              return precedence[token.value] || 0;
          };

          // Associativity: 
          const isRightAssociative = (token: Token): boolean => {
              if (token.type !== 'operator') {
                  throw new Error("Invalid token");
              }
              return token.isUnary; // because unary operators are right-associative
          };

          for (const token of tokens) {
              if (token.type === 'number') {
                  outputQueue.push(token);
              } else if (token.type === 'leftParen') {
                  operatorStack.push(token);
              } else if (token.type === 'rightParen') {
                  while (operatorStack.length > 0 && operatorStack[operatorStack.length-1].type !== 'leftParen') {
                      outputQueue.push(operatorStack.pop());
                  }
                  if (operatorStack.length > 0 && operatorStack[operatorStack.length-1].type === 'leftParen') {
                      operatorStack.pop(); // remove the leftParen
                  }
                  // else: error, unmatched parenthesis
              } else if (token.type === 'operator') {
                  // While there is an operator at the top of the operatorStack and it is not a leftParen,
                  // and (if the operator is left-associative: precedence >= current, if right-associative: precedence > current)
                  while (operatorStack.length > 0 && 
                         operatorStack[operatorStack.length-1].type !== 'leftParen' &&
