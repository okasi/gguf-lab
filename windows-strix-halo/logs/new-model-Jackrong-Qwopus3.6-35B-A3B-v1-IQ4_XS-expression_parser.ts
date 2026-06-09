function precedence(token):
                    if token.unary: return 3
                    else if token.value === '*' || token.value === '/': return 2
                    else: return 1   // for + and -

                function associativity(token):
                    if token.unary: return 'right'
                    else: return 'left'

            But note: the unary operator token has the 'unary' flag.

 3. Evaluation of RPN.

    We traverse the RPN tokens:
        stack = []
        for token in rpn:
            if token.type == 'number':
                stack.push(token.value)
            else if token.type == 'operator':
                if token.unary:
                    // pop one operand
                    if stack.length < 1: error
                    b = stack.pop()
                    if token.value === '+': a = b  // unary plus
                    else if token.value === '-': a = -b
                    stack.push(a)
                else:
                    // binary operator
                    if stack.length < 2: error
                    b = stack.pop()
                    a = stack.pop()
                    if token.value === '+': c = a + b
                    else if token.value === '-': c = a - b
                    else if token.value === '*': c = a * b
                    else if token.value === '/': c = a / b  // truncates toward zero
                    stack.push(c)

            if token.type == 'paren': // should not happen in RPN, but if it does, skip? Actually, we shouldn't have parentheses in RPN.

    After processing, stack should have one element.

    However, note: the division truncates toward zero. In JavaScript, the '/' operator for integers truncates toward zero? 
        For positive: 5/2 = 2.5 -> but we want integer division that truncates toward zero. 
        Actually, for positive: 5/2 = 2 (if we truncate) but JavaScript does 2.5 and then we convert to integer? 
        But the problem says: "Division truncates toward zero", meaning integer division that truncates toward zero.

        However, the problem says: "All intermediate values fit in JavaScript safe integers." and we are to return an integer.

        How to do truncating division toward zero?
            We can use Math.trunc(a / b) for integers.

        But note: the problem says "truncates toward zero", so for negative: 
            -5 / 2 = -2.5 -> truncates to -2.

        In JavaScript, the '/' operator for integers does not truncate
