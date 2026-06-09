We are going to implement a shunting-yard algorithm to convert the expression to Reverse Polish Notation (RPN) and then evaluate it.
 Steps:
 1. Tokenize the expression: we need to handle integers, operators (+, -, *, /), and parentheses.
    Note: unary + and - are also operators, but they are different from binary operators.
    We can distinguish unary operators by context: if the operator is at the beginning of the expression, or after an opening parenthesis, or after another operator, then it is unary.

 2. We'll use two stacks: one for operators and one for output (RPN).

 3. We'll define precedence and associativity for operators:
    - Unary + and - have the highest precedence and are right-associative.
    - * and / have the next precedence and are left-associative.
    - + and - (binary) have the lowest precedence and are left-associative.

 4. We'll process the tokens one by one:
    - If the token is a number, push it to the output stack.
    - If the token is an operator, we pop from the operator stack to the output stack until we find an operator with lower precedence (or equal precedence and left-associative) or an opening parenthesis, then push the current operator.
    - If the token is an opening parenthesis, push it to the operator stack.
    - If the token is a closing parenthesis, pop from the operator stack to the output stack until we find an opening parenthesis. Then pop the opening parenthesis.

 5. After processing all tokens, pop any remaining operators from the operator stack to the output stack.

 6. Evaluate the RPN expression using a stack.

 However, note that unary operators are different. We need to handle them specially.

 Approach for unary operators:
    We can treat unary operators as having a different precedence and associativity.
    Alternatively, we can convert the expression to RPN by considering unary operators as having a higher precedence and being right-associative.

 Let's define:
    Precedence:
        Unary + and - : 3
        * and / : 2
        Binary + and - : 1

    Associativity:
        Unary + and - : right
        * and / : left
        Binary + and - : left

 But note: in the shunting-yard algorithm, when we encounter an operator, we pop operators from the stack that have higher precedence, or same precedence and left-associative.

 Steps for shunting-yard with unary operators:

    We'll have a flag to indicate if the next operator is unary. We can set this flag when we see an opening parenthesis or at the beginning of the expression, or after an operator.

    Alternatively, we can determine the nature of an operator by its context.

    Let's do:

        Initialize:
            output = []
            operatorStack = []
            unary = true   // because the first operator we see might be unary

        For each token:
            if token is a number:
                output.push(token)
                unary = false   // because after a number, the next operator is binary (unless it's an expression like 1+2, but note: after a number we expect an operator or end, but if we have a number and then an operator, that operator is binary? Actually, we can have unary after a number? No, because unary is for negative numbers. But note: we have already tokenized the numbers, so we don't have unary minus in the number. We have separate tokens for unary minus.

            if token is an operator:
                if unary:
                    // This is a unary operator. We need to push it to the operator stack with a special handling.
                    // But note: we can treat unary operators as having a different precedence and associativity.
                    // We'll push the unary operator to the operator stack, but we must consider that it has higher precedence.

                    // However, the shunting-yard algorithm for unary operators is a bit tricky.

                else:
                    // This is a binary operator.

                Actually, we can do:

                We'll have two types of operators: unary and binary.

                We can define:

                    operator precedence:
                        unary +: 3, right
                        unary -: 3, right
                        *: 2, left
                        /: 2, left
                        +: 1, left
                        -: 1, left

                But then, when we see a unary operator, we must not pop the operators that are already on the stack because they are not of higher precedence? Actually, we do pop the operators that have higher precedence? But unary has the highest precedence.

                However, note: the unary operator is applied to the number that comes after it. So we must push the unary operator to the stack and then when we see the next number, we will apply the unary operator.

                But in the shunting-yard algorithm, we are building the RPN. The RPN for unary operators should have the operator after the operand. So we need to push the unary operator to the output when we have the operand? Actually, no: in RPN, the operator comes after the operands. So for a unary operator, we need to push the operand and then the operator.

                How to handle:

                    We can have the unary operator on the operator stack, and when we encounter the next number, we will push the number to the output, and then we will pop the unary operator from the operator stack and push it to the output? But that would be too early because the unary operator might be applied to a number that is not the next one? Actually, unary operators are applied to the immediate next number (or expression in parentheses).

                Alternatively, we can treat the unary operator as having a higher precedence and then when we see the next number, we will push the number and then the unary operator? But that would be wrong because the unary operator should be applied to the number that comes after it.

                Let me think of an example: -2 + 3

                Tokens: unary -, 2, +, 3

                We want RPN: 2 unary- 3 +

                Steps:

                    token: unary -
                        This is a unary operator. We push it to the operator stack.

                    token: 2
                        Push 2 to output.

                    token: +
                        This is a binary operator. We pop from the operator stack until we find an operator with lower precedence. The unary - has precedence 3, which is higher than + (1), so we pop unary - and push to output. Then push + to operator stack.

                    token: 3
                        Push 3 to output.

                Then we pop the + and push to output.

                RPN: 2 unary- 3 +

                Then evaluation: 
                    stack: [2]
                    unary-: pop 2, push -2 -> stack: [-2]
                    3: push 3 -> stack: [-2, 3]
                    +: pop 3 and -2, push -2+3=1 -> stack: [1]

                So it works.

                But what about: -2 * 3

                Tokens: unary -, 2, *, 3

                Steps:

                    token: unary -
                        push to operator stack.

                    token: 2
                        push to output.

                    token: *
                        This is a binary operator. We pop from the operator stack until we find an operator with lower precedence. The unary - has precedence 3, which is higher than * (2), so we pop unary - and push to output. Then push * to operator stack.

                    token: 3
                        push to output.

                Then pop * and push to output.

                RPN: 2 unary- 3 *

                Evaluation:
                    stack: [2]
                    unary-: pop 2, push -2 -> stack: [-2]
                    3: push 3 -> stack: [-2, 3]
                    *: pop 3 and -2, push -2*3=-6 -> stack: [-6]

                So it works.

                But what about: 2 * -3

                Tokens: 2, *, unary -, 3

                Steps:

                    token: 2
                        push to output.

                    token: *
                        This is a binary operator. We push to operator stack.

                    token: unary -
                        This is a unary operator. We push to operator stack.

                    token: 3
                        push to output.

                Then we pop the unary - and push to output, then pop the * and push to output.

                RPN: 2 3 unary- *

                Evaluation:
                    stack: [2]
                    3: push 3 -> stack: [2, 3]
                    unary-: pop 3, push -3 -> stack: [2, -3]
                    *: pop -3 and 2, push 2*-3=-6 -> stack: [-6]

                So it works.

                However, note that the unary operator is applied to the number that comes after it. In the RPN, the unary operator comes after the number. So we must ensure that the unary operator is pushed to the output after the number.

                How do we know when to push the unary operator to the output? We push it when we are popping operators from the operator stack to the output. But note: the unary operator is on the operator stack until we pop it.

                But what about nested unary operators? Example: --2

                Tokens: unary -, unary -, 2

                Steps:

                    token: unary -
                        push to operator stack.

                    token: unary -
                        This is a unary operator. We push it to the operator stack.

                    token: 2
                        push to output.

                Then we pop the unary - (the second one) and push to output, then pop the first unary - and push to output.

                RPN: 2 unary- unary-

                Evaluation:
                    stack: [2]
                    unary-: pop 2, push -2 -> stack: [-2]
                    unary-: pop -2, push 2 -> stack: [2]

                So it works.

                But what about: - ( -2 )

                Tokens: unary -, (, unary -, 2, )

                Steps:

                    token: unary -
                        push to operator stack.

                    token: (
                        push to operator stack.

                    token: unary -
                        push to operator stack.

                    token: 2
                        push to output.

                    token: )
                        pop from operator stack until we find (, so we pop unary - and push to output, then pop ( and discard.

                Then we pop the unary - (the first one) and push to output.

                RPN: 2 unary- unary-

                Same as above.

                So the algorithm for shunting-yard:

                    We'll have:
                        output = []
                        operatorStack = []
                        unary = true   // because the first token might be a unary operator

                    For each token:
                        if token is a number:
                            output.push(token)
                            unary = false   // because after a number, the next operator is not unary? Actually, we can have a unary operator after a number? No, because the unary operator must be followed by a number. But note: we have already tokenized the numbers, so we don't have unary minus in the number. However, we can have a unary operator after a number? Actually, no: the unary operator is for negative numbers, so it must be before a number. But in the expression, we can have: 1 + -2, so after a number we can have a unary operator? Actually, in 1 + -2, the unary operator is after a binary operator. So we can have a unary operator after a binary operator.

                        How to handle:

                            We can set unary to true when we see an opening parenthesis or an operator (because after an operator, the next token might be a unary operator or a number).

                        So:

                            if token is an operator:
                                if token is a unary operator (i.e., + or - and it is unary):
                                    // We need to push this unary operator to the operator stack.
                                    // But note: we must consider that it has higher precedence and is right-associative.

                                    // We pop operators from the operator stack that have higher precedence than the unary operator? 
                                    // Actually, the unary operator has the highest precedence (3), so we don't pop any operator? 
                                    // But wait: we might have a unary operator on the stack? Actually, we can have multiple unary operators.

                                    // However, the unary operator is right-associative, so we don't pop operators of the same precedence? 
                                    // But note: we are going to push the unary operator to the stack, and then when we see the next number, we will push the number and then we will pop the unary operator? Actually, no: we are building the RPN, so we push the unary operator to the output when we are popping operators from the operator stack.

                                    // But the unary operator is on the operator stack until we pop it. How do we pop it? We pop it when we see a binary operator or a closing parenthesis? 

                                    // Actually, we pop the unary operator when we are processing a binary operator or a closing parenthesis? 

                                    // Let me think: in the example -2 + 3, we popped the unary operator when we saw the binary operator +.

                                    // So when we see a binary operator, we pop the unary operator from the operator stack and push it to the output.

                                    // But what if we have: -2 * 3, we pop the unary operator when we see the binary operator *.

                                    // And what if we have: -2 ) , we pop the unary operator when we see the closing parenthesis.

                                    // So the rule: when we see a binary operator or a closing parenthesis, we pop the unary operators from the operator stack and push them to the output.

                                    // But note: we might have a unary operator that is not applied to a number? Actually, no: every unary operator must be applied to a number.

                                    // So we can do:

                                    // When we see a binary operator or a closing parenthesis, we pop all unary operators from the operator stack and push them to the output.

                                    // But wait: what about the unary operator that is applied to a number that is not the next one? Actually, the unary operator is applied to the next number (or expression in parentheses). So when we see a binary operator or a closing parenthesis, we know that the unary operator has been applied to the number that came after it? Actually, no: the unary operator is applied to the number that comes after it, and that number might be followed by a binary operator or a closing parenthesis.

                                    // So we must pop the unary operator from the operator stack and push it to the output only after we have pushed the number to the output? 

                                    // But in the shunting-yard algorithm, we push the operator to the output when we are popping it from the operator stack. So when we see a binary operator or a closing parenthesis, we pop the unary operator and push it to the output, and then we push the binary operator or pop the closing parenthesis.

                                    // However, the unary operator must be applied to the number that came before the binary operator? Actually, no: the unary operator is applied to the number that comes after it, and that number is already in the output.

                                    // Example: -2 + 3
                                    //   token: unary - -> operatorStack: [unary-]
                                    //   token: 2 -> output: [2]
                                    //   token: + -> we pop unary- from operatorStack and push to output: output: [2, unary-], then push + to operatorStack.
                                    //   token: 3 -> output: [2, unary-, 3]
                                    //   then pop + and push to output: output: [2, unary-, 3, +]

                                    // So the unary operator is after the number and before the binary operator.

                                    // Therefore, we must pop the unary operator when we see a binary operator or a closing parenthesis.

                                    // But what about: - ( -2 )
                                    //   token: unary - -> operatorStack: [unary-]
                                    //   token: ( -> operatorStack: [unary-, (]
                                    //   token: unary - -> operatorStack: [unary-, (, unary-]
                                    //   token: 2 -> output: [2]
                                    //   token: ) -> we pop until we find (, so we pop unary- and push to output: output: [2, unary-], then pop ( and discard.
                                    //   then we pop the first unary- and push to output: output: [2, unary-, unary-]

                                    // So it works.

                                    // Therefore, we can do:

                                    // When we see a binary operator or a closing parenthesis, we pop all unary operators from the operator stack and push them to the output.

                                    // But note: we might have a unary operator that is not applied to a number? Actually, no: every unary operator must be applied to a number.

                                    // However, what if we have: - * 2? That is invalid, but we assume the expression is valid.

                                    // So the algorithm:

                                    //   if token is an operator:
                                    //       if token is unary:
                                    //           // We push the unary operator to the operator stack.
                                    //           operatorStack.push(token)
                                    //           unary = true   // because after a unary operator, we expect a number or another unary operator? Actually, we can have multiple unary operators.
                                    //       else: // binary operator
                                    //           // We pop operators from the operator stack that have higher precedence than the current binary operator, or same precedence and left-associative.
                                    //           while (operatorStack.length > 0 && 
                                    //                  (precedence(operatorStack[operatorStack.length-1]) > precedence(token) || 
                                    //                   (precedence(operatorStack[operatorStack.length-1]) == precedence(token) && associativity(token) == 'left')) &&
                                    //                  operatorStack[operatorStack.length-1] != '(') {
                                    //               output.push(operatorStack.pop())
                                    //           }
                                    //           operatorStack.push(token)
                                    //           unary = false   // because after a binary operator, we expect a number or a unary operator? Actually, we can have a unary operator after a binary operator? Yes, like 1 + -2.

                                    //   if token is an opening parenthesis:
                                    //       operatorStack.push(token)
                                    //       unary = true   // because after an opening parenthesis, we expect a number or a unary operator.

                                    //   if token is a closing parenthesis:
                                    //       // Pop until we find an opening parenthesis, and push the operators to the output.
                                    //       while (operatorStack.length > 0 && operatorStack[operatorStack.length-1] != '(') {
                                    //           // But we must not pop the opening parenthesis.
                                    //           // Also, we must pop unary operators? Actually, we pop all operators until we find the opening parenthesis.
                                    //           // But note: we might have unary operators on the stack. We pop them and push to output.
                                    //           output.push(operatorStack.pop())
                                    //       }
                                    //       if (operatorStack.length > 0 && operatorStack[operatorStack.length-1] == '(') {
                                    //           operatorStack.pop()   // pop the opening parenthesis
                                    //       }
                                    //       unary = false   // because after a closing parenthesis, we expect a binary operator or the end.

                                    // But wait: in the closing parenthesis, we are popping all operators until we find the opening parenthesis. This includes unary operators? Yes, and we push them to the output. But note: the unary operators are popped and pushed to the output, which is correct because they have been applied to the number that came after the opening parenthesis.

                                    // However, what about: - (2 + 3)
                                    //   token: unary - -> operatorStack: [unary-]
                                    //   token: ( -> operatorStack: [unary-, (]
                                    //   token: 2 -> output: [2]
                                    //   token: + -> we pop unary-? No, because we are popping until we find an opening parenthesis? Actually, no: we are popping operators that have higher precedence than the current operator? But wait, we are not popping in the closing parenthesis.

                                    //   Actually, in the closing parenthesis, we are popping all operators until we find the opening parenthesis. So we pop the + and push to output, then we pop the ( and discard.

                                    //   Then we pop the unary- and push to output? But wait, we haven't popped the unary- yet. We are still in the closing parenthesis.

                                    //   After the closing parenthesis, we pop the unary- and push to output.

                                    //   So the steps:

                                    //       token: unary - -> operatorStack: [unary-]
                                    //       token: ( -> operatorStack: [unary-, (]
                                    //       token: 2 -> output: [2]
                                    //       token: + -> we push + to operatorStack? But wait, we are not in the closing parenthesis yet.

                                    //       Actually, we are processing token by token.

                                    //       token: unary - -> operatorStack: [unary-]
                                    //       token: ( -> operatorStack: [unary-, (]
                                    //       token: 2 -> output: [2]
                                    //       token: + -> we are processing a binary operator. We pop operators from the operatorStack that have higher precedence than +. The operatorStack has [unary-, (]. The ( is not an operator, so we don't pop it. The unary- has precedence 3, which is higher than + (1), so we pop unary- and push to output: output: [2, unary-]. Then we push + to operatorStack: operatorStack: [+, (]? Wait, no: we popped unary- and then we push +? But the operatorStack was [unary-, (], we popped unary- and then we push +? But then the operatorStack becomes [+, (]? Actually, no: we popped unary- and then we push +, so operatorStack: [+, (]? But wait, we had [unary-, (] and we popped unary-, so we have [ ( ] and then we push +, so operatorStack: [+, (]? But that doesn't make sense because the ( is below the +.

                                    //   Actually, the operatorStack is a stack, so we push to the top. So after pushing +, the operatorStack is [+, (]? But the ( is at the bottom? Actually, no: we push to the top, so the top is the last element. So after pushing +, the operatorStack is [+, (]? But the ( is at the bottom? Actually, no: we had [unary-, (] and we popped unary-, so we have [ ( ] and then we push +, so the operatorStack becomes [ (, + ]? But that would be wrong because the ( is at the bottom and + is at the top.

                                    //   Let me clarify: we are using an array and pushing to the end, so the top of the stack is the last element.

                                    //   Initially: operatorStack = []
                                    //   token: unary - -> operatorStack = ['unary-']
                                    //   token: ( -> operatorStack = ['unary-', '(']
                                    //   token: 2 -> output = [2]
                                    //   token: + -> we are processing a binary operator. We pop from the operatorStack until we find an operator with lower precedence or an opening parenthesis. The top of the operatorStack is '(' which is not an operator, so we don't pop it. Then we push + to the operatorStack: operatorStack = ['unary-', '(', '+']

                                    //   Then token: 3 -> output = [2, 3]
                                    //   token: ) -> we pop until we find '(', so we pop '+' and push to output: output = [2, 3, '+'], then pop '(' and discard. Then we pop the unary- and push to output: output = [2, 3, '+', 'unary-']

                                    //   But wait, the unary- is at the end, which is correct because it is applied to the entire expression in parentheses.

                                    //   Then evaluation:
                                    //       stack: [2]
                                    //       3: push 3 -> stack: [2, 3]
                                    //       +: pop 3 and 2, push 5 -> stack: [5]
                                    //       unary-: pop 5, push -5 -> stack: [-5]

                                    //   So it works.

                                    //   Therefore, we must pop the unary- at the closing parenthesis.

                                    //   So the algorithm for closing parenthesis:

                                    //       while (operatorStack.length > 0 && operatorStack[operatorStack.length-1] != '(') {
                                    //           output.push(operatorStack.pop())
                                    //       }
                                    //       if (operatorStack.length > 0 && operatorStack[operatorStack.length-1] == '(') {
                                    //           operatorStack.pop()   // pop the opening parenthesis
                                    //       }
                                    //       // After popping the opening parenthesis, we might have unary operators on the stack? Actually, we just popped the opening parenthesis, but the unary operators are still on the stack? No, we popped the unary operators when we were popping until we found the opening parenthesis? Actually, no: we popped until we found the opening parenthesis, so the unary operators are still on the stack? 

                                    //   Wait, in the example above, after popping the '+', we have operatorStack = ['unary-', '(']. Then we pop the '(' and discard, so operatorStack = ['unary-']. Then we pop the unary- and push to output.

                                    //   But note: we are popping the unary- after the closing parenthesis? Actually, we are popping it in the closing parenthesis step? No, we are popping it in the step after the closing parenthesis? Actually, no: we are popping it in the same step? 

                                    //   Let me re-read: in the closing parenthesis step, we pop until we find the opening parenthesis. So we pop the '+' and then we pop the '(' and discard. Then we are done with the closing parenthesis. But the unary- is still on the operatorStack. Then we continue to the next token? But there is no next token. Then we pop the remaining operators from the operatorStack and push to output.

                                    //   So after the closing parenthesis, we have operatorStack = ['unary-'], and then we pop it and push to output.

                                    //   So we must do: after the closing parenthesis, we don't set unary to false? Actually, we set unary to false after the closing parenthesis? But then we have a unary operator on the stack, and we will pop it at the end.

                                    //   Alternatively, we can pop the unary operators at the closing parenthesis? But note: the unary operator is applied to the entire expression in parentheses, so it must be applied after the expression is evaluated. So we push the unary operator to the output after the expression is evaluated? Actually, in the RPN, the unary operator comes after the expression. So we push the unary operator to the output after the expression is evaluated? But in the shunting-yard, we push the unary operator to the output when we are popping it from the operator stack. And we pop it when we see a binary operator or a closing parenthesis? But in this case, we are popping it at the closing parenthesis? Actually, no: we are popping it at the end of the expression.

                                    //   So we can do: after the closing parenthesis, we don't pop the unary operator immediately. We leave it on the operatorStack and then at the end of the expression, we pop it and push to output.

                                    //   But then the RPN will be: 2 3 + unary-

                                    //   And evaluation: 
                                    //       stack: [2]
                                    //       3: push 3 -> stack: [2, 3]
                                    //       +: pop 3 and 2, push 5 -> stack: [5]
                                    //       unary-: pop 5, push -5 -> stack: [-5]

                                    //   So it works.

                                    //   Therefore, we don't need to pop the unary operator at the closing parenthesis. We leave it on the operatorStack and then at the end of the expression, we pop it and push to output.

                                    //   But what about: - (2 + 3) * 4

                                    //   Tokens: unary -, (, 2, +, 3, ), *, 4

                                    //   Steps:

                                    //       token: unary - -> operatorStack: [unary-]
                                    //       token: ( -> operatorStack: [unary-, (]
                                    //       token: 2 -> output: [2]
                                    //       token: + -> operatorStack: [unary-, (, +]   (because we don't pop the unary- since we are not in the closing parenthesis and we are not popping until we find an opening parenthesis? Actually, no: we are popping until we find an operator with lower precedence? But the unary- has higher precedence, so we pop it? 

                                    //   Wait, we are processing the binary operator +. We pop operators from the operatorStack that have higher precedence than +. The unary- has precedence 3, which is higher than + (1), so we pop unary- and push to output: output: [2, unary-]. Then we push + to operatorStack: operatorStack: [+, (]? But wait, we had [unary-, (] and we popped unary-, so we have [ ( ] and then we push +, so operatorStack: [+, (]? But the ( is at the bottom? Actually, no: we push to the top, so the operatorStack is [ (, + ]? But that would be wrong because the ( is at the bottom and + is at the top.

                                    //   Let me clarify: we are using an array and pushing to the end, so the top of the stack is the last element.

                                    //   Initially: operatorStack = []
                                    //   token: unary - -> operatorStack = ['unary-']
                                    //   token: ( -> operatorStack = ['unary-', '(']
                                    //   token: 2 -> output = [2]
                                    //   token: + -> we are processing a binary operator. We pop from the operatorStack until we find an operator with lower precedence or an opening parenthesis. The top of the operatorStack is '(' which is not an operator, so we don't pop it. Then we push + to the operatorStack: operatorStack = ['unary-', '(', '+']

                                    //   Then token: 3 -> output = [2, 3]
                                    //   token: ) -> we pop until we find '(', so we pop '+' and push to output: output = [2, 3, '+'], then pop '(' and discard. Then we pop the unary- and push to output: output = [2, 3, '+', 'unary-']

                                    //   Then token: * -> we are processing a binary operator. We pop from the operatorStack until we find an operator with lower precedence than *. The operatorStack is now empty? Because we popped the unary- at the closing parenthesis? Actually, no: we popped the unary- at the closing parenthesis? Wait, we popped the unary- at the closing parenthesis? In the closing parenthesis step, we popped the '+' and then the '(', and then we popped the unary- and pushed to output. So the operatorStack is empty.

                                    //   Then we push * to operatorStack: operatorStack = ['*']

                                    //   Then token: 4 -> output = [2, 3, '+', 'unary-', 4]

                                    //   Then we pop the * and push to output: output = [2, 3, '+', 'unary-', 4, '*']

                                    //   Evaluation:
                                    //       stack: [2]
                                    //       3: push 3 -> stack: [2, 3]
                                    //       +: pop 3 and 2, push 5 -> stack: [5]
                                    //       unary-: pop 5, push -5 -> stack: [-5]
                                    //       4: push 4 -> stack: [-5, 4]
                                    //       *: pop 4 and -5
