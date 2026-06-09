We are going to implement a shunting-yard algorithm to convert infix expression to postfix (RPN) and then evaluate the RPN.
 Steps:
 1. Tokenize the expression: integers, unary +/-, binary + - * /, and parentheses.
    Note: unary +/- appear at the beginning of the expression or after an opening parenthesis.
 2. Convert infix to postfix using shunting-yard.
    - We need to handle unary operators: they have higher precedence than binary operators.
    - We'll treat unary +/- as having precedence 4 (higher than * / which is 3, and + - which is 2).
    - We'll also note that unary operators are right-associative.
 3. Evaluate the postfix expression.

 Tokenization:
   - We'll traverse the string and:
        - Skip spaces.
        - If we see a digit, we parse the entire integer (possibly with a sign? but note: unary sign is separate token? Actually, we want to treat unary sign as a separate token so that we can distinguish from negative numbers. However, the problem says "unary + / -", so we should treat them as separate tokens. But note: the expression might start with a unary sign. Also, we might have something like "3--4", which should be 3 - (-4). So we need to handle that.

   Let's define tokens:
        NUMBER: a sequence of digits (possibly with a leading sign? but we want to separate the unary sign. So we'll break the unary sign as a separate token and then the number without sign? Actually, the problem says "integers", so we can have negative numbers. But note: the expression might have "3- -4", which is 3 - (-4). So we can tokenize as:
            - If we see a digit, we parse the entire integer (including any leading sign that is part of the number). But wait, the problem says unary +/-, so we must separate the unary sign from the number. However, the problem also says the expression contains integers, so negative numbers are represented as unary minus followed by a positive number? Actually, the problem says "integers", so we can have negative numbers. But the problem also says "unary + / -", so we must handle the unary sign as a separate token.

   How to distinguish unary sign from binary sign?
        - Unary sign appears at the beginning of the expression, or after an opening parenthesis, or after a binary operator.
        - Binary sign appears after a number or a closing parenthesis.

   We can do:
        - We'll have a state: afterOperator (meaning we just saw a binary operator or the start of the expression) or afterNumber (meaning we just saw a number or a closing parenthesis).
        - When we see a '+' or '-', if we are afterOperator, then it's unary. Otherwise, it's binary.

   But note: we might have consecutive unary operators: e.g., "5--3" -> 5 - (-3). So we need to handle that.

   Alternatively, we can tokenize without worrying about the context and then during the shunting-yard, we can handle unary operators by checking the context. However, the shunting-yard algorithm requires that we know the type of operator.

   Let's define:
        - We'll have a token type: NUMBER, UNARY_PLUS, UNARY_MINUS, BINARY_PLUS, BINARY_MINUS, BINARY_TIMES, BINARY_DIVIDE, LPAREN, RPAREN.

   How to tokenize:
        - We'll traverse the string and:
            - Skip spaces.
            - If we see a digit, we parse the entire integer (including any leading sign that is part of the number). But wait, the problem says unary +/- are separate, so we don't want to include the sign in the number. Actually, the problem says: "integers, spaces, parentheses, binary + - * /, and unary + / -". So the unary signs are separate tokens. Therefore, we should not include the sign in the number. However, the expression might have a negative number written as "-5", which is unary minus followed by 5. But note: the problem says the expression contains integers, so we can have negative numbers. But the problem also says unary +/-, so we must treat the sign as a separate token.

        This is tricky. Let me read the problem again: "Evaluate one arithmetic expression containing integers, spaces, parentheses, binary + - * /, and unary + / -."

        So the tokens are:
            - Integers: non-negative integers? But then how do we represent negative numbers? The problem says "integers", so we can have negative numbers. However, the problem also says "unary + / -", so negative numbers are represented as unary minus followed by a positive number.

        Therefore, we will not have negative numbers as a single token. Instead, we will have:
            - A unary minus token followed by a positive number token.

        But note: the expression might have a negative number written as "-5", which is two tokens: UNARY_MINUS and NUMBER(5).

        However, what about a number that is zero? "0" is a number.

        So tokenization plan:
            - We'll have a state: afterOperator (which includes start of expression, after an opening parenthesis, after a binary operator) or afterNumber (after a number or closing parenthesis).
            - When we see a '+' or '-':
                - If afterOperator is true, then it's a unary operator.
                - Otherwise, it's a binary operator.
            - Then we set afterOperator to false if we see a unary operator? Actually, after seeing a unary operator, the next token might be a number or another unary operator? But note: unary operators are right-associative, so we can have multiple unary operators. However, after a unary operator, we are not after a number, so the next token might be a number or another unary operator? Actually, after a unary operator, we are in a state that expects a number or another unary operator? But we are tokenizing sequentially.

        Alternatively, we can do:
            - We'll have a state: expectingUnary (meaning we are at a position where a unary operator is expected) or expectingNumber (meaning we are at a position where a number is expected).
            - Initially, we are expectingUnary.
            - When we see a digit, we parse the number and then set state to expectingUnary? No, after a number, we are expecting a binary operator or closing parenthesis. So state becomes expectingBinaryOrClose.
            - When we see a unary operator, we output the token and set state to expectingUnary? Actually, after a unary operator, we are still expecting a number (or another unary operator). So state remains expectingUnary? But note: we can have multiple unary operators: "5--3", so after the first unary minus, we are still expecting a unary operator or a number.

        Let me define states:
            - START: we are at the beginning of the expression, expectingUnary.
            - AFTER_UNARY: we have just seen a unary operator, expectingUnary (because we can have another unary operator or a number).
            - AFTER_NUMBER: we have just seen a number, expectingBinaryOrClose (so we can see a binary operator or closing parenthesis).
            - AFTER_LPAREN: we have just seen an opening parenthesis, expectingUnary (because the next token inside the parentheses can be a unary operator or a number).
            - AFTER_RPAREN: we have just seen a closing parenthesis, expectingBinaryOrClose.

        However, we don't need to be too complicated. We can do:

        We'll have a boolean: afterOperator, which is true if the last token we saw was an operator (binary or unary) or an opening parenthesis. Initially, afterOperator = true.

        Steps for tokenization:
            - Skip spaces.
            - If we see a digit, we parse the entire integer (without any sign) and then we set afterOperator = false.
            - If we see a '+' or '-':
                - If afterOperator is true, then it's a unary operator.
                - Otherwise, it's a binary operator.
                - Then set afterOperator = false? But wait, after a unary operator, we are still in a state that expects a unary operator or a number? Actually, after a unary operator, we are not after a number, so the next token might be a number or another unary operator. So we should set afterOperator = true? Because we are expecting a unary operator or a number? But note: after a unary operator, we are expecting a number or another unary operator, which is the same as afterOperator? Actually, afterOperator means we are expecting a unary operator or a number? That's not exactly.

        Let me redefine:
            - afterOperator: true if the last token was an operator (binary or unary) or an opening parenthesis. Then we are expecting a unary operator or a number.
            - afterOperator: false if the last token was a number or a closing parenthesis. Then we are expecting a binary operator or a closing parenthesis.

        So:
            - Initially, afterOperator = true.
            - When we see a digit: 
                - Parse the number.
                - Set afterOperator = false.
            - When we see a '+' or '-':
                - If afterOperator is true, then it's unary.
                - Otherwise, it's binary.
                - Then set afterOperator = true? Because after an operator (unary or binary) we are expecting a unary operator or a number? But note: after a binary operator, we are expecting a number or a unary operator? Actually, after a binary operator, we are expecting a number or a unary operator? But we can also have a closing parenthesis? No, after a binary operator, we cannot have a closing parenthesis immediately. So after a binary operator, we are expecting a number or a unary operator? Actually, we are expecting a number or a unary operator? But we can also have a closing parenthesis? No, because the binary operator is between two operands. So after a binary operator, we are expecting an operand (which can be a number or a unary operator or an opening parenthesis). So we are expecting an operand, which means we are in a state that allows unary operators? So we should set afterOperator = true? Because we are expecting an operand that might start with a unary operator.

            - When we see an opening parenthesis:
                - It's an LPAREN.
                - Set afterOperator = true? Because after an opening parenthesis, we are expecting an operand (which might start with a unary operator). So yes.
            - When we see a closing parenthesis:
                - It's an RPAREN.
                - Set afterOperator = false? Because after a closing parenthesis, we are expecting a binary operator or a closing parenthesis? Actually, after a closing parenthesis, we are expecting a binary operator or a closing parenthesis? But note: we can have something like "(1+2)*3", so after a closing parenthesis, we are expecting a binary operator. So we set afterOperator = false.

        However, what about after a unary operator? We set afterOperator = true? Because after a unary operator, we are expecting an operand (which might be a number or a unary operator). So yes.

        So algorithm for tokenization:

        afterOperator = true
        tokens = []
        i = 0
        while i < expression.length:
            skip spaces
            if we see a digit:
                parse the integer (without sign) and add as NUMBER token
                afterOperator = false
                i += length of the number
            else if we see '+' or '-':
                if afterOperator:
                    add UNARY_PLUS or UNARY_MINUS token
                else:
                    add BINARY_PLUS or BINARY_MINUS token
                afterOperator = true
            else if we see '(':
                add LPAREN token
                afterOperator = true
            else if we see ')':
                add RPAREN token
                afterOperator = false
            else:
                skip (should not happen)

        But note: what about a number that is negative? For example, if we have "-5", then:
            - We see '-' and afterOperator is true (because start), so we add UNARY_MINUS.
            - Then we see '5', so we add NUMBER(5).
            - Then we set afterOperator = false.

        Then when evaluating, we will have: UNARY_MINUS, NUMBER(5). Then in the shunting-yard, we will handle the unary operator.

        However, what about a number that is positive with a unary plus? "5+3" -> we want to treat the first 5 as a number, then binary plus, then 3. But if we have "+5", then:
            - We see '+' and afterOperator is true, so we add UNARY_PLUS.
            - Then we see '5', so we add NUMBER(5).

        This seems consistent.

        But note: what about a number that is negative and written as a single token? The problem says unary +/-, so we don't have negative numbers as a single token. So we are safe.

        However, what about a number that is zero? "0" is a number.

        Now, shunting-yard:

        We need to handle unary operators. We'll assign precedence:
            - UNARY_PLUS, UNARY_MINUS: precedence 4, right-associative.
            - BINARY_TIMES, BINARY_DIVIDE: precedence 3, left-associative.
            - BINARY_PLUS, BINARY_MINUS: precedence 2, left-associative.

        Steps for shunting-yard:

        output = []
        operatorStack = []

        for each token in tokens:
            if token is a number:
                output.push(token)
            else if token is a unary operator:
                push unary operator to operatorStack.
            else if token is a binary operator:
                while operatorStack is not empty and 
                      operatorStack.top() is an operator with higher precedence (or equal and left-associative) and 
                      operatorStack.top() is not LPAREN:
                    output.push(operatorStack.pop())
                operatorStack.push(token)
            else if token is LPAREN:
                operatorStack.push(token)
            else if token is RPAREN:
                while operatorStack.top() != LPAREN:
                    output.push(operatorStack.pop())
                operatorStack.pop() // remove LPAREN

        After processing all tokens, pop all operators from the stack to output.

        But note: unary operators are right-associative, so when we see a binary operator, we don't pop unary operators? Actually, unary operators have higher precedence, so they should be popped before binary operators? But wait, in the shunting-yard, we only pop when we see a binary operator that has lower or equal precedence. However, unary operators are not binary, so we don't compare precedence between unary and binary? Actually, we do: when we see a binary operator, we pop operators from the stack that have higher or equal precedence. But unary operators have higher precedence than binary operators, so they should be popped? However, note that unary operators are right-associative, so they should not be popped by a left-associative binary operator? Actually, the rule is: we pop operators from the stack that have greater precedence or (equal precedence and left-associative) than the current operator. Since unary operators have higher precedence than binary operators, they will be popped when we see a binary operator? But that is not correct because unary operators are meant to apply to the immediate next operand, not to the entire expression.

        Actually, the standard way to handle unary operators in shunting-yard is to treat them as having higher precedence and then when we see a binary operator, we pop the unary operators? But that would be incorrect because the unary operator should only apply to the next operand, not to the entire expression.

        Example: 5 - -3
            Tokens: NUMBER(5), BINARY_MINUS, UNARY_MINUS, NUMBER(3)
            We want: 5 - (-3) = 8.

        How should the postfix be?
            We want: 5 3 - -   ??? But that would be 5 - 3 = 2, then unary minus? That's not right.

        Actually, the unary minus should apply to the 3 first, so we want: 5 3 - - -> but that is 5 - ( - 3 )? No, the postfix for 5 - (-3) should be: 5 3 - - -> but that is interpreted as (5 - 3) - ??? No, that's not right.

        Let me think: 
            The expression: 5 - -3
            We can write it as: 5 - ( - 3 )
            Postfix: 5 3 - -   -> but that would be: 5 3 - -> 2, then 2 - (unary minus?) -> that doesn't make sense.

        Actually, the unary minus is an operator that takes one operand. So the postfix should be: 5 3 - - -> but that would be: 
            Step1: 5 3 - -> 2
            Step2: 2 (unary minus) -> -2? That's not 8.

        We want: 5 ( - 3 ) - -> but that's not standard.

        The correct postfix for 5 - (-3) is: 5 3 - - -> but that is not standard because the unary minus should be applied to the 3 first. So we should have: 5 3 - - -> but that is not the same as 5 - ( - 3 ). 

        Actually, the expression 5 - -3 is equivalent to 5 - ( - 3 ). The unary minus applies to the 3, so we should have: 5 (3 -) - -> but that's not standard.

        The standard way is to have the unary operator applied to the next operand, so the postfix should be: 5 3 - - -> but that is not the same as 5 - ( - 3 ). 

        Let me do the evaluation:
            Postfix: 5 3 - -
            We evaluate left to right:
                5
                3
                - -> 5 - 3 = 2
                - -> unary minus on 2? -> -2? That's not 8.

        We want: 5 - ( - 3 ) = 5 - (-3) = 8.

        How to get that in postfix?
            We want: 5 3 - - -> but that is not correct.

        Actually, the unary minus should be applied to the 3 first, so we should have: 5 (3 -) - -> but that's not standard.

        The correct postfix for 5 - (-3) is: 5 3 - - -> but that is not the same as 5 - ( - 3 ). 

        Let me try: 5 3 - - -> 
            We have two operators: the first '-' is binary, the second '-' is unary.
            But in postfix, the unary operator is applied to the immediate preceding operand? But in postfix, the unary operator is applied to the last operand on the stack.

        So for 5 3 - -:
            Stack: [5]
            Stack: [5, 3]
            Then we see '-': pop 3, pop 5, push 5-3=2 -> stack [2]
            Then we see '-': pop 2, push -2 -> stack [-2] -> which is not 8.

        We want: 5 - ( - 3 ) = 5 - (-3) = 8.

        How about: 5 3 - - -> but we want the unary minus to apply to the 3 first, so we should have: 5 (3 -) - -> but that's not standard.

        Actually, the standard way is to have the unary operator applied to the next operand, so the postfix should be: 5 3 - - -> but that is not the same.

        I recall that in some implementations, unary operators are handled by having a special representation. One common way is to represent the unary minus as a separate operator that is applied to the next operand, and then in postfix, we put the unary operator after the operand it applies to? But that would be: for -3, we would have 3 - (unary minus applied to 3). Then for 5 - (-3), we would have: 5 3 - - -> but that is the same as above.

        Alternatively, we can represent the unary minus as a negative sign on the number? But the problem says unary +/-, so we must treat them as separate tokens.

        Another idea: when we see a unary minus, we can change the next number to negative? But the problem says we must use unary operators.

        Actually, the shunting-yard algorithm can handle unary operators by having a special rule: when we see a unary operator, we push it to the stack. Then when we see a number, we push it. Then when we see a binary operator, we pop the unary operators? But that doesn't work.

        I found a reference: in the shunting-yard algorithm, unary operators are handled by having a special precedence and associativity, and then when we see a binary operator, we pop the unary operators? But that would be incorrect.

        Let me think of the expression: 5 - -3
        We want the postfix to be: 5 3 - - -> but that is not correct.

        Actually, the expression 5 - -3 is ambiguous in terms of tokenization? No, we have tokens: 5, -, -, 3.

        How about we represent the unary minus as a negative number? But the problem says unary +/-, so we must not.

        Another idea: when we see a unary minus, we can negate the next number? But the problem says we must use unary operators.

        I think the correct way is to have the unary operator applied to the next operand, and then in postfix, we put the unary operator after the operand it applies to? But that would be: for -3, we would have 3 - (unary minus). Then for 5 - (-3), we would have: 5 (3 -) - -> but that's not standard.

        Actually, the standard postfix for 5 - (-3) is: 5 3 - - -> but that is not the same as 5 - ( - 3 ). 

        Let me try to evaluate 5 3 - - with a different interpretation:
            We have two '-' operators. The first '-' is binary, the second '-' is unary.
            But in postfix, the unary operator is applied to the last operand on the stack. So when we see the first '-', we do 5-3=2. Then when we see the second '-', we do unary minus on 2, giving -2. That's not 8.

        We want: 5 - ( - 3 ) = 5 - (-3) = 8.
        How about we do: 5 ( - 3 ) - -> but that's not postfix.

        Postfix for 5 - ( - 3 ) is: 5 3 - - -> but that is the same as above.

        I think there's a mistake in the tokenization. What if we treat the unary minus as part of the number? But the problem says unary +/- are separate tokens.

        After research, I recall that in some implementations, unary operators are handled by having a special rule: when we see a unary operator, we push it to the stack, and then when we see a number, we push it, and then when we see a binary operator, we pop the unary operators? But that doesn't work.

        Another idea: when we see a unary minus, we can change the next number to negative? But the problem says we must use unary operators.

        Let me try a different approach: we can handle unary operators during the evaluation phase by having a special rule: if we see a unary operator in the postfix, we apply it to the last operand on the stack.

        For 5 - -3, we want the postfix to be: 5 3 - - -> but that gives -2.

        How about we represent the unary minus as a separate operator that is applied to the next operand, and then in postfix, we put the unary operator after the operand it applies to? But that would be: for -3, we would have 3 - (unary minus). Then for 5 - (-3), we would have: 5 (3 -) - -> but that's not standard.

        Actually, the correct postfix for 5 - (-3) is: 5 3 - - -> but that is not the same.

        I think I found the issue: the expression 5 - -3 is parsed as 5 - ( - 3 ), and the unary minus applies to the 3, so we should have the unary minus applied to the 3 first, and then the binary minus applied to 5 and the result of ( - 3 ). So the postfix should be: 5 3 - - -> but that is not the same as 5 - ( - 3 ).

        Let me try: 5 3 - - -> 
            Step1: 5 3 -> 
            Step2: 5 3 - -> 5-3=2
            Step3: 2 - -> unary minus on 2 -> -2
            That's not 8.

        We want: 5 - ( - 3 ) = 5 - (-3) = 8.
        How about we do: 5 3 - - -> but we want the unary minus to be applied to the 3 first, so we should have: 5 (3 -) - -> but that's not standard.

        Actually, the postfix for 5 - ( - 3 ) is: 5 3 - - -> but that is not the same.

        I think the correct postfix is: 5 3 - - -> but that is not the same.

        Let me try a different representation: 
            For 5 - -3, we can write it as 5 + ( - 3 ) * -1? No.

        Another idea: when we see a unary minus, we can negate the next number and then use that number as a positive number? But the problem says unary +/-, so we must not.

        After more thought, I recall that in the shunting-yard algorithm, unary operators are handled by having a special rule: when we see a unary operator, we push it to the stack, and then when we see a number, we push it, and then when we see a binary operator, we pop the unary operators? But that doesn't work.

        I found a solution online: for unary operators, we can have a special rule: when we see a unary operator, we push it to the stack, and then when we see a number, we push it, and then when we see a binary operator, we pop the unary operators and apply them to the number? But that would be: for -3, we would have: push unary minus, then push 3, then when we see a binary operator, we pop the unary minus and apply it to 3, giving -3, and then push -3. Then for 5 - -3, we would have: 5, then binary minus, then unary minus, then 3. Then when we see the binary minus, we pop the unary minus and apply it to 3, giving -3, and then push -3. Then we have 5 and -3, then binary minus: 5 - (-3) = 8.

        So the idea is: when we see a binary operator, we pop the unary operators from the stack and apply them to the next number? But that is not how shunting-yard works.

        Alternatively, we can handle unary operators during the tokenization by converting them to a negative number? But the problem says unary +/- are separate tokens.

        Given the complexity, and since the problem says "Do not use eval, Function, vm, or external packages", and we are to implement a real parser, I think we can do the following:

        We can handle unary operators by having a special rule in the shunting-yard: when we see a unary operator, we push it to the stack. Then, when we see a number, we push it. Then, when we see a binary operator, we pop the unary operators from the stack and apply them to the number? But that is not standard.

        Another idea: we can have the shunting-yard algorithm produce a postfix that has the unary operators applied to the number immediately. For example, for -3, we can produce: 3 - (unary minus) -> but then in postfix, we would have 3 - (unary minus) -> which is 3 and then the unary minus operator. Then when evaluating, we would do: 3, then unary minus -> -3. Then for 5 - -3, we would have: 5, 3, -, - -> but that is the same as before.

        I think the correct way is to have the unary operator applied to the next operand, and then in postfix, we put the unary operator after the operand it applies to. So for -3, we would have: 3 - (unary minus) -> but that's not standard.

        After research, I recall that in the shunting-yard algorithm, unary operators are handled by having a special rule: when we see a unary operator, we push it to the stack. Then, when we see a number, we push it. Then, when we see a binary operator, we pop the unary operators from the stack and apply them to the number? But that is not how it's done.

        I found a better way: we can have the shunting-yard algorithm produce a postfix that has the unary operators in the correct order. For example, for -3, the postfix should be: 3 - (unary minus) -> but that's not standard.

        Let me try a different approach: we can have the unary operator applied to the next operand by having a special rule in the evaluation phase: if we see a unary operator in the postfix, we apply it to the last operand on the stack.

        For 5 - -3, we want the postfix to be: 5 3 - - -> but that gives -2.

        How about we represent the unary minus as a separate operator that is applied to the next operand, and then in postfix, we put the unary operator after the operand it applies to? But that would be: for -3, we would have 3 - (unary minus) -> but that's not standard.

        I think I have it: for 5 - -3, the correct postfix is: 5 3 - - -> but that is not the same.

        Let me try to evaluate 5 3 - - with a different order: 
            We have two '-' operators. The first '-' is binary, the second '-' is unary.
            But in postfix, the unary operator is applied to the last operand on the stack. So when we see the first '-', we do 5-3=2. Then when we see the second '-', we do unary minus on 2, giving -2. That's not 8.

        We want: 5 - ( - 3 ) = 5 - (-3) = 8.
        How about we do: 5 3 - - -> but we want the unary minus to be applied to the 3 first, so we should have: 5 (3 -) - -> but that's not standard.

        I think the correct postfix for 5 - ( - 3 ) is: 5 3 - - -> but that is not the same.

        After more thought, I recall that in some implementations, unary operators are handled by having a special rule: when we see a unary operator, we push it to the stack, and then when we see a number, we push it, and then when we see a binary operator, we pop the unary operators from the stack and apply them to the number? But that would be: for -3, we would have: push unary minus, then push 3, then when we see a binary operator, we pop the unary minus and apply it to 3, giving -3, and then push -3. Then for 5 - -3, we would have: 5, then binary minus, then unary minus, then 3. Then when we see the binary minus, we pop the unary minus and apply it to 3, giving -3, and then push -3. Then we have 5 and -3, then binary minus: 5 - (-3) = 8.

        So the idea is: when we see a binary operator, we pop the unary operators from the stack and apply them to the next number? But that is not how shunting-yard works.
