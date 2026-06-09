"use strict";
[];
opStack = [];
for (token in tokens)
    : if (token.type === 'NUM')
        : output.push(token);
    else if (token.type === 'UPLUS')
        or;
token.type === 'UMINUS';
while (opStack.length > 0 &&
    opStack[opStack.length - 1].type !== 'LPAREN' &&
    precedence(opStack[opStack.length - 1]) >= precedence(token) &&
    (associativity(token) === 'right' || (associativity(token) === 'left' && precedence(opStack[opStack.length - 1]) < precedence(token))))
    : 
    // Actually, for right associative, we use >= for same precedence, but for left associative we use > for same precedence? 
    // But note: the problem says unary operators are right associative, and they have higher precedence than others.
    // However, the condition for popping: 
    //   For right associative: we pop operators with precedence >= current.
    //   For left associative: we pop operators with precedence > current, and also operators with the same precedence if they are left associative? 
    //   Actually, the standard is:
    //      while (there is an operator at the top of the operator stack with greater precedence than the current operator) 
    //          or (same precedence and left associative) 
    //      pop the operator from the stack onto the output queue.
    // But wait: the standard shunting-yard for right associative: 
    //      while (there is an operator at the top of the operator stack with greater precedence than the current operator) 
    //          pop the operator from the stack onto the output queue.
    //      if the operator at the top of the operator stack has the same precedence and the current operator is left associative, pop the operator from the stack onto the output queue.
    //      if the operator at the top of the operator stack has the same precedence and the current operator is right associative, do not pop.
    //
    // However, the standard is a bit different. Let me check:
    //   For left associative: we pop operators with precedence greater than or equal? Actually, no: 
    //      We pop operators with precedence greater than, and also operators with the same precedence if they are left associative? 
    //   But note: the standard for left associative: we pop operators with precedence greater than or equal? Actually, no: 
    //      We pop operators with precedence greater than, and then for same precedence, we do not pop if the current operator is right associative? 
    //   Actually, the standard is:
    //      while (there is an operator at the top of the operator stack with precedence greater than the current operator)
    //          pop the operator from the stack onto the output queue.
    //      if the operator at the top of the operator stack has the same precedence and the current operator is left associative, pop the operator from the stack onto the output queue.
    //      if the operator at the top of the operator stack has the same precedence and the current operator is right associative, do not pop.
    //
    // But wait, the problem says:
    //   unary + and - are right associative, and they have precedence 3.
    //   * and / have precedence 2, left associative.
    //   + and - have precedence 1, left associative.
    //
    // So for a unary operator (right associative, precedence 3) and the top of the stack is a * or / (precedence 2, left associative):
    //   precedence(top) = 2 < 3, so we don't pop the * or /? 
    //   But wait, we want to pop operators with higher precedence? Actually, we pop operators that have higher precedence than the current operator? 
    //   No: the rule is: we pop operators that have precedence greater than the current operator, or equal and left associative.
    //
    // However, note: the unary operator has higher precedence, so we don't want to pop the * and /? Actually, we want to keep the * and / on the stack until we see the unary operator? 
    //   But the unary operator is after the * and /? Actually, no: the unary operator comes first in the expression? 
    //   Example: " - 3 * 4" -> tokens: [UMINUS, NUM(3), BINOP(*), NUM(4)]
    //      When we see UMINUS: 
    //          opStack is empty, so we push UMINUS.
    //      Then we see NUM(3): push to output.
    //      Then we see BINOP(*): 
    //          precedence(*) = 2, precedence(UMINUS) = 3 -> so 3 > 2, so we do not pop UMINUS? 
    //          But we want to pop operators with higher precedence? Actually, we pop operators that have higher precedence? 
    //          The rule: we pop operators that have precedence greater than the current operator? 
    //          Actually, the rule is: we pop operators that have precedence greater than the current operator, or equal and left associative.
    //          Here, 3 > 2, so we pop UMINUS? 
    //          But wait, the unary operator has higher precedence, so it should be applied first? 
    //          However, the RPN should be: 3 UMINUS 4 * -> which means: 3 is negated, then multiplied by 4.
    //          So we want the unary operator to be on the stack until we see the next operator? 
    //          Actually, no: the unary operator is applied to the number 3, so we want to pop the unary operator when we see the next operator? 
    //          But the next operator is * which has lower precedence, so we don't pop the unary operator? 
    //          Then we push the * operator. Then we see 4: push to output. Then we pop the * operator and the unary operator? 
    //          But wait, the unary operator is still on the stack? Then when we see the * operator, we check: 
    //             precedence(*) = 2, precedence(UMINUS) = 3 -> 3 > 2, so we pop UMINUS to output. Then we push *.
    //          Then we see 4: push to output.
    //          Then we pop * and then the unary operator is already popped? 
    //          So output: [3, UMINUS, 4, *] -> which is correct.
    //
    //      So the rule for the shunting-yard: 
    //          while (opStack not empty and opStack.top != '(' and 
    //                 (precedence(opStack.top) > precedence(token) or 
    //                  (precedence(opStack.top) == precedence(token) and associativity(token) === 'left'))) 
    //              pop to output.
    //          Then push token.
    //
    //      But note: for right associative, we only pop if precedence(opStack.top) > precedence(token) (because if equal, we don't pop for right associative).
    //
    //      So the condition: 
    //          while (opStack.length > 0 && 
    //                 opStack[opStack.length-1].type !== 'LPAREN' &&
    //                 precedence(opStack[opStack.length-1]) > precedence(token) ||
    //                 (precedence(opStack[opStack.length-1]) === precedence(token) && associativity(token) === 'left'))
    //
    //      However, note: the operator on top might be a unary operator? We need to handle that.
    // Let me define the precedence and associativity for each token type:
    //   UPLUS: 3, right
    //   UMINUS: 3, right
    //   BINOP * and /: 2, left
    //   BINOP + and -: 1, left
    // Then for the condition:
    //   while (opStack.length > 0 && 
    //          opStack[opStack.length-1].type !== 'LPAREN' &&
    //          (precedence(opStack[opStack.length-1]) > precedence(token) ||
    //           (precedence(opStack[opStack.length-1]) === precedence(token) && associativity(token) === 'left')))
    //      pop to output.
    // But wait: what if the top of the stack is an operator with the same precedence and the current operator is left associative? Then we pop.
    // What if the top of the stack is an operator with higher precedence? Then we pop.
    // However, note: the unary operator has precedence 3, and the binary * and / have precedence 2, so 3>2, so we pop the unary operator when we see a * or /? 
    //   That is what we want: because the unary operator is applied first.
    // But what about: "3 * -4" -> tokens: [3, BINOP(*), UMINUS, 4]
    //   When we see BINOP(*): 
    //        opStack is empty -> push *.
    //   When we see UMINUS: 
    //        precedence(*) = 2, precedence(UMINUS) = 3 -> 2 < 3, so we do not pop the *, we push UMINUS.
    //   Then we see 4: push to output.
    //   Then at the end, we pop *: output: [3, 4, UMINUS, *] -> which is correct.
    //   But wait, the condition for UMINUS: 
    //        while (opStack.length>0 && opStack.top != '(' and 
    //               (precedence(opStack.top) > 3 or (precedence(opStack.top)==3 and associativity(UMINUS)==left)))
    //        But associativity(UMINUS) is right, so the second condition is false.
    //        And precedence(opStack.top) = 2 < 3, so we don't pop.
    //   So we push UMINUS.
    //   Then when we see the next operator? There is no next operator. So we pop the UMINUS and then the *? 
    //   But the condition for popping at the end: we pop all operators.
    //   So the RPN is: 3, 4, UMINUS, * -> which is correct.
    //   However, what about: "3 * - 4" -> same as above.
    //   But what about: " - 3 * 4" -> tokens: [UMINUS, 3, BINOP(*), 4]
    //        When we see UMINUS: 
    //            opStack is empty -> push UMINUS.
    //        When we see 3: push to output.
    //        When we see BINOP(*): 
    //            precedence(UMINUS) = 3, precedence(*) = 2 -> 3>2, so we pop UMINUS to output. Then push *.
    //        Then 4: push to output.
    //        Then pop *: output: [3, UMINUS, 4, *] -> correct.
    //   So the condition is: 
    //        while (opStack.length > 0 && 
    //               opStack[opStack.length-1].type !== 'LPAREN' &&
    //               (precedence(opStack[opStack.length-1]) > precedence(token) ||
    //                (precedence(opStack[opStack.length-1]) === precedence(token) && associativity(token) === 'left')))
    //            pop to output.
    //   Then push token.
    // But note: what if the top of the stack is an operator with the same precedence and the current operator is left associative? Then we pop.
    // Example: "3 + 4 + 5" -> tokens: [3, BINOP(+), 4, BINOP(+), 5]
    //   When we see the second BINOP(+): 
    //        precedence(+) = 1, precedence(+) = 1, and associativity(+) is left -> so we pop the first + to output, then push the second +.
    //   Then output: [3,4,+,5,+] -> which is correct.
    //   So we'll use that condition.
    // So:
    while (opStack.length > 0 &&
        opStack[opStack.length - 1].type !== 'LPAREN' &&
        (precedence(opStack[opStack.length - 1]) > precedence(token) ||
            (precedence(opStack[opStack.length - 1]) === precedence(token) && associativity(token) === 'left'))) {
        output.push(opStack.pop());
    }
opStack.push(token);
if (token.type === 'BINOP')
    : while (opStack.length > 0 &&
        opStack[opStack.length - 1].type)
        ;
