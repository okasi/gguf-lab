while there are tokens to read:
    read token
    if token is number: push to output
    if token is operator o1:
        while there is operator o2 at top of stack with:
            (o2 has greater precedence than o1) OR
            (o2 has same precedence and o1 is left-associative)
            AND o2 is not left parenthesis:
            pop o2 to output
        push o1 to stack
    if token is left parenthesis: push to stack
    if token is right parenthesis:
        while top of stack is not left parenthesis:
            pop from stack to output
        pop left parenthesis from stack
