function precedence(token):
             if token is unary + or -: return 3
             if token is * or /: return 2
             if token is + or - (binary): return 1

        Left associative:
          For unary operators: not applicable? Actually, we are not popping unary operators when a unary operator comes because we push unary operators without checking precedence? But wait, in the above, we don't pop for unary operators. So we don't need associativity for unary operators in the popping condition? Actually, we only pop for binary operators.

          But what if we have: "++1" -> two unary operators. We push both. Then when we see the number, we push it. Then when we see the end, we pop both unary operators to the output. So the output is: unary+, unary+, 1. Then we evaluate: apply the first unary+ to 1 (gets 1), then the next unary+ to 1 (gets 1). But we want the outermost to be applied last? Actually, no: the RPN is: 1, unary+, unary+. Then we apply the first unary+ to 1 (which is the top of the stack) and then the next unary+ to the result. So it is: 
            stack: [1]
            unary+: pop 1, apply unary+ -> 1, push 1
            unary+: pop 1, apply unary+ -> 1, push 1
          So it works.

          However, note: the expression "++1" is two unary operators. The RPN: 1, unary+, unary+. Then when evaluating, we apply the first unary+ to 1 (which is the number) and then the second unary+ to the result. But the first unary+ is the one that comes first in the RPN? Actually, in the RPN, the operators are applied in the order they appear? But wait, the RPN is: [unary+, unary+, 1] -> then we read left to right:
            - 1: push 1
            - unary+: pop 1, apply unary+ -> 1, push 1
            - unary+: pop 1, apply unary+ -> 1, push 1
          So it's correct.

        But what about: "-+1"? 
          Tokens: unary-, unary+, 1
          RPN: unary-, unary+, 1
          Evaluation: 
            1: push 1
            unary+: pop 1, apply unary+ -> 1, push 1
            unary-: pop 1, apply unary- -> -1, push -1
          But the expression "-+1" is: -(+1) = -1. Correct.

        However, what about: "+-1"?
          Tokens: unary+, unary-, 1
          RPN: unary+, unary-, 1
          Evaluation:
            1: push 1
            unary-: pop 1, apply unary- -> -1, push -1
            unary+: pop -1, apply unary+ -> -1, push -1
          Expression: +(-1) = -1. Correct.

        So the shunting-yard with unary operators as separate tokens and pushed to the stack works.

        But note: there is a problem with the expression: "1*+2" (which is 1 * (+2)). The tokens: 1, *, unary+, 2.
          In shunting-yard:
            - 1: push to output
            - *: push to stack (since stack empty)
            - unary+: push to stack (because it's unary, and we don't pop because we don't pop unary operators? But wait, in the above, we push unary operators without popping. However, when we see a unary operator, we push it to the stack. Then when we see the number 2, we push it to output. Then at the end, we pop the stack: first pop unary+ to output, then pop * to output.
            So RPN: 1,2,unary+,*
          Evaluation:
            1: push 1
            2: push 2
            unary+: pop 2, apply unary+ -> 2, push 2
            *: pop 2 and 1, apply * -> 2*1=2? But we want 1 * 2 = 2. However, the order: we pop two operands: first pop 2, then pop 1, then apply * -> 1 * 2 = 2. Correct.

        But what about: "1+*2"? That is invalid, so we don't worry.

        Steps for evaluation of RPN:
          stack = []
          For each token in RPN:
            If token is 'number': push its value to stack
            If token is 'op':
               pop two operands? But unary operators pop only one operand.
               If the operator is unary, pop one operand, apply the operator, push the result.
               Else (binary), pop two operands (first pop is right operand, second pop is left operand), apply the operator, push the result.

          However, note: for unary operators, we only have one operand.

        But wait: in the RPN, the unary operator is represented by a token with isUnary=true. So we can do:
          if token.isUnary:
             operand = stack.pop()
             result = applyUnary(token.value, operand)
             stack.push(result)
          else:
             right = stack.pop()
             left = stack.pop()
             result = applyBinary(token.value, left, right)
             stack.push(result)

        Functions for applyUnary and applyBinary:
          applyUnary(op, operand):
            if op == '+': return operand
            if op == '-': return -operand

          applyBinary(op, left, right):
            if op == '+': return left + right
            if op == '-': return left - right
            if op == '*': return left * right
            if op == '/': 
               // division truncates toward zero
               // In JavaScript, division of integers that are within safe integers, and we want truncation toward zero.
               // Note: JavaScript's / operator for integers truncates toward zero only for positive results? Actually, no: for negative, it truncates toward zero as well? Let me check:
               //   Math.trunc is used for truncation toward zero.
               // But the problem says: "Division truncates toward zero", so we can use Math.trunc? However, we are using integers and the numbers are safe, so we can use:
               //   Math.trunc(left / right)
               // But note: the problem says "all intermediate values fit in JavaScript safe integers", so we can do:
               //   Math.trunc(left / right)

          However, note: the division operator in JavaScript for integers that are safe integers: 
            For example: -5 / 2 = -2.5, and Math.trunc(-2.5) = -2, which is truncation toward zero.

          But the problem says "truncates toward zero", so we must use Math.trunc.

        Steps for the program:
          Read the expression from stdin.
          Tokenize the expression.
          Convert to RPN.
          Evaluate RPN.
          Print the result.

        Let's code accordingly.

        However, note: the expression might have a unary operator at the end? For example: "1+" -> invalid, so we assume well-formed.

        Let me test with an example: "1+2" -> 
          Tokens: number(1), op('+', isUnary=false), number(2)
          Shunting-yard:
            1: output -> [1]
            '+': push to stack -> stack=[op('+')]
            2: output -> [1,2]
            End: pop stack -> [1,2,op('+')]
          RPN: [1,2,op('+')]
          Evaluation: 
            1: stack=[1]
            2: stack=[1,2]
            op('+'): pop 2 and 1, 1+2=3, push 3 -> stack=[3]
          Output: 3. Correct.

        Example: "1-2" -> 
          Tokens: number(1), op('-', isUnary=false), number(2)
          RPN: [1,2,op('-')]
          Evaluation: 1-2 = -1. Correct.

        Example: "1*2+3" ->
          Tokens: 1, *, 2, +, 3
          Shunting-yard:
            1: output [1]
            *: push stack [ * ]
            2: output [1,2]
            +: precedence of + (1) <= precedence of * (2) -> so pop * to output, then push + -> output [1,2,*], stack [+]
            3: output [1,2,*,3]
            End: pop + -> [1,2,*,3,+]
          Evaluation: 
            1: stack[1]
            2: stack[1,2]
            *: pop 2 and 1 -> 1*2=2, push 2 -> [2]
            3: push 3 -> [2,3]
            +: pop 3 and 2 -> 2+3=5, push 5 -> [5]
          Output: 5. Correct.

        Example: "1+2*3" -> 
          Tokens: 1, +, 2, *, 3
          Shunting-yard:
            1: [1]
            +: push stack [ + ]
            2: [1,2]
            *: precedence of * (2) > precedence of + (1) -> so don't pop +, push * -> stack [ +, * ]
            3: [1,2,3]
            End: pop * then + -> [1,2,3,*,+]
          Evaluation: 
            1: [1]
            2: [1,2]
            3: [1,2,3]
            *: pop 3 and 2 -> 2*3=6, push 6 -> [1,6]
            +: pop 6 and 1 -> 1+6=7, push 7 -> [7]
          Output: 7. Correct.

        Example: "(1+2)*3" ->
          Tokens: (, 1, +, 2, ), *, 3
          Shunting-yard:
            (: push stack [ ( ]
            1: output [1]
            +: push stack [ (, + ]
            2: output [1,2]
            ): pop until '(' -> pop + to output, then pop '(' -> output [1,2,+], stack []
            *: push stack [ * ]
