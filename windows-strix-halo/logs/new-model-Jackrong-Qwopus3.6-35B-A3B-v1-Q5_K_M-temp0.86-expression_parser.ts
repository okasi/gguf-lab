function getPrecedence(op: string): number {
            if (op === 'UPLUS' || op === 'UMINUS') return 3;
            if (op === '*' || op === '/') return 2;
            if (op === '+' || op === '-') return 1;
            return 0; // for '(' and others, but we don't use for '(' in this function because we don't compare '(' in the while condition for operators? Actually, we do: when we see ')', we pop until '(', but we don't use getPrecedence for '('.

          }

          function isRightAssociative(op: string): boolean {
            return (op === 'UPLUS' || op === 'UMINUS');
          }

        But note: in the while condition, we check "stack.top is an operator". We need to know what is an operator. We can define a set: 
          operatorSet = new Set(['+', '-', '*', '/', 'UPLUS', 'UMINUS']);

        However, note: when we are in the while condition, we are comparing with an operator that is on the stack. The stack might have '(' which is not an operator. So we should check: if stack.top is in operatorSet and is an operator, then we check precedence.

        So condition:

          while (stack.length > 0) {
            const top = stack[stack.length-1];
            if (operatorSet.has(top)) {
              // It's an operator
              const topPrec = getPrecedence(top);
              const curPrec = getPrecedence(token);
              if (topPrec > curPrec || (topPrec === curPrec && !isRightAssociative(token))) {
                output.push(stack.pop());
              } else {
                break;
              }
            } else {
              // top is '(', which is not an operator, so we break
              break;
            }
          }

        Alternatively, we can do:

          while (stack.length > 0 && operatorSet.has(stack[stack.length-1])) {
            const top = stack[stack.length-1];
            if (getPrecedence(top) > getPrecedence(token) || 
                (getPrecedence(top) === getPrecedence(token) && !isRightAssociative(token))) {
              output.push(stack.pop());
            } else {
              break;
            }
          }

        But note: we must break when we see a '(' because '(' is not an operator and we don't want to pop it.

        Alternatively, we can check: if the top is not an operator, we break. So:

          while (stack.length > 0) {
            const top = stack[stack.length-1];
            if (!operatorSet.has(top)) {
              break;
            }
            if (getPrecedence(top) > getPrecedence(token) || 
                (getPrecedence(top) === getPrecedence(token) && !isRightAssociative(token))) {
              output.push(stack.pop());
            } else {
              break;
            }
          }

        This is safe.

        Now, evaluation of RPN:

        We have a stack for numbers.

        For each token in output:
          if token is a number: push to stack.
          else if token is an operator:
            if it's a unary operator (UPLUS or UMINUS):
              pop one operand, apply the operator, push the result.
            else (binary operator: +, -, *, /):
              pop two operands (note: the first pop is the right operand, the second pop is the left operand).
              apply the operator, push the result.

        Important: for division, we truncate toward zero. In JavaScript, the / operator for integers does truncation toward zero? Actually, for positive numbers, yes. But for negative numbers, JavaScript's / does not truncate toward zero? Let me check:

          (-5) / 2 -> -2.5, then truncating toward zero would be -2? But JavaScript: (-5)/2 = -2.5, and if we use Math.trunc, then Math.trunc(-2.5) = -2.

          However, the problem says "Division truncates toward zero". So we must use truncation toward zero.

          In JavaScript, we can use: 
            Math.trunc(a / b)

          But note: the problem says "All intermediate values fit in JavaScript safe integers", so we can use Math.trunc.

        However, note: the operands are integers, but the division might produce a non-integer. We need to truncate the result to an integer toward zero.

        Example: 5/2 = 2.5 -> truncates to 2; (-5)/2 = -2.5 -> truncates to -2.

        So for division: 
          result = Math.trunc(left / right)

        But note: the problem says "truncates toward zero", which is exactly what Math.trunc does.

        Steps for evaluation:

          stack = []
          for token of output:
            if token is a number:
              stack.push(token)
            else if token is 'UPLUS':
              operand = stack.pop();
              stack.push(operand)  // unary plus does nothing
            else if token is 'UMINUS':
              operand = stack.pop();
              stack.push(-operand)
            else if token is '+':
              right = stack.pop();
              left = stack.pop();
              stack.push(left + right)
            else if token is '-':
              right = stack.pop();
              left = stack.pop();
              stack.push(left - right)
            else if token is '*':
              right = stack.pop();
              left = stack.pop();
              stack.push(left * right)
            else if token is '/':
              right = stack.pop();
              left = stack.pop();
              // Check for division by zero? The problem doesn't specify, but we assume valid expression without division by zero.
              stack.push(Math.trunc(left / right))

        Now, let's code step by step.

        Steps:

        1. Read the expression from stdin using fs.readFileSync(0, "utf8").
        2. Tokenize the expression.
        3. Convert infix tokens to postfix using shunting-yard.
        4. Evaluate the postfix expression.

        Let's write the code accordingly.

        Note: We must handle the tokenization carefully.

        Implementation of tokenizer:

        We'll traverse the string character by character.

        We'll have an array of tokens.

        We'll keep track of the previous token to determine unary operators.

        Pseudocode for tokenizer:

        const tokens: (number | string)[] = [];
        let i = 0;
        let prevToken: string | number | null = null;

        while (i < expression.length) {
          // Skip spaces
          if (expression[i] === ' ') {
            i++;
            continue;
          }

          if (expression[i] >= '0' && expression[i] <= '9') {
            // Read the entire number
            let numStr = '';
            while (i < expression.length && expression[i] >= '0' && expression[i] <= '9') {
              numStr += expression[i];
              i++;
            }
            const num = parseInt(numStr, 10);
            tokens.push(num);
            prevToken = num;
          } else if (expression[i] === '(') {
            tokens.push('(');
            prevToken = '(';
            i++;
          } else if (expression[i] === ')') {
            tokens.push(')');
            prevToken = ')';
            i++;
          } else if (expression[i] === '+' || expression[i] === '-') {
            // Check if unary
            if (prevToken === null || 
                prevToken === '+' || prevToken === '-' || prevToken === '*' || prevToken === '/' || 
                prevToken === 'UPLUS' || prevToken === 'UMINUS' || prevToken === '(') {
              // unary
              if (expression[i] === '+') {
                tokens.push('UPLUS');
              } else {
                tokens.push('UMINUS');
              }
              prevToken = expression[i] === '+' ? 'UPLUS' : 'UMINUS';
            } else {
              // binary
              tokens.push(expression[i]);
              prevToken = expression[i];
            }
            i++;
          } else if (expression[i] === '*' || expression[i] === '/') {
            tokens.push(expression[i]);
            prevToken = expression[i];
            i++;
          } else {
            // Unknown character? The problem says only integers, spaces, parentheses, and operators. So we can ignore or throw an error.
            // Let's skip and hope it doesn't happen.
            i++;
          }
        }

        Now, shunting-yard:

        const operatorSet = new Set(['+', '-', '*', '/', 'UPLUS', 'UMINUS']);

        function getPrecedence(op: string): number {
          switch (op) {
            case 'UPLUS':
            case 'UMINUS': return 3;
            case '*':
            case '/': return 2;
            case '+':
            case '-': return 1;
            default: return 0;
          }
        }

        function isRightAssociative(op: string): boolean {
          return (op === 'UPLUS
