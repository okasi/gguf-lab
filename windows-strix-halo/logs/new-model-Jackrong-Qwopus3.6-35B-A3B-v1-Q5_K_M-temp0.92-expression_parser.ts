function parseExpression(): number
                  function parseTerm(): number
                  function parseFactor(): number

                And we'll have a global index to the current token.

                Steps:

                  tokens: list of tokens.

                  function parseExpression():
                    left = parseTerm()
                    while current token is '+' or '-' (binary):
                        op = current token
                        consume token
                        right = parseTerm()
                        left = op(left, right)   // op is + or -
                    return left

                  function parseTerm():
                    left = parseFactor()
                    while current token is '*' or '/':
                        op = current token
                        consume token
                        right = parseFactor()
                        left = op(left, right)
                    return left

                  function parseFactor():
                    if current token is unary '+' or unary '-':
                        op = current token
                        consume token
                        right = parseFactor()
                        if op is unary '+': return right
                        if op is unary '-': return -right
                    else if current token is '(':
                        consume token
                        result = parseExpression()
                        if current token is not ')': error
                        consume token
                        return result
                    else if current token is a number:
                        value = token.value
                        consume token
                        return value
                    else: error

                But note: the grammar for Factor as written above is left-recursive? Actually, it's right-recursive, but we are parsing recursively, so it's okay.

                However, the grammar:

                  Factor -> ('+' | '-') Factor | '(' Expression ')' | number

                This is right-recursive, but we are using recursion to handle the unary operators. For a long chain of unary operators, it will recurse deeply. But the problem says intermediate values fit in safe integers, and the expression is not too long, so it should be okay.

                Alternatively, we can make it left-recursive by using a loop? But the standard way for unary operators is to use right-recursion.

                But note: the grammar above does not allow a number without an operator in front? Actually, it does: because we have the alternative of a number.

                However, the grammar is ambiguous? Actually, no, because the unary operators are left-associative? But wait, unary operators are right-associative? Actually, unary operators are right-associative in the sense that:

                  - - 1 -> -( -1 ) -> 1? Actually, no: - - 1 is 1? But mathematically, it's 1. However, in terms of evaluation, it doesn't matter because unary minus is its own inverse. But for unary plus, it's also identity.

                But the grammar above will parse - - 1 as:

                  Factor: 
                    unary - -> 
                      Factor: 
                         unary - ->
                           Factor: number 1 -> 1
                        -> -1
                    -> -(-1) = 1

                So it's correct.

                However, the grammar is not in the standard form because it has right-recursion. But we can handle it.

                But note: the problem says unary + and unary - have the highest precedence, and this grammar reflects that.

                Let me test with a simple expression: 1+2*3

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm: 
                            left = parseFactor() -> 1
                            while current token is '*' or '/'? current token is '+', so break.
                            return 1
                    while current token is '+' or '-': 
                         op = '+', consume
                         right = parseTerm() -> 
                              parseTerm:
                                 left = parseFactor() -> 2
                                 current token is '*', so consume '*'
                                 right = parseFactor() -> 3
                                 left = 2*3 = 6
                              return 6
                         left = 1+6 = 7

                Correct.

                Now, test with: -1+2

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 
                                 unary - -> 
                                    Factor: number 1 -> 1
                                 -> -1
                            while current token is '*' or '/'? current token is '+', so break.
                            return -1
                    while current token is '+' or '-': 
                         op = '+', consume
                         right = parseTerm() -> 
                              parseTerm:
                                 left = parseFactor() -> 2
                                 while current token is '*' or '/'? no, so break.
                                 return 2
                         left = -1 + 2 = 1

                Correct.

                Now, test with: -1*-2

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 
                                 unary - -> 
                                    Factor: number 1 -> 1
                                 -> -1
                            while current token is '*' or '/'? current token is '*', so consume '*'
                            right = parseFactor() -> 
                                 unary - -> 
                                    Factor: number 2 -> 2
                                 -> -2
                            left = -1 * -2 = 2
                    while current token is '+' or '-'? no, so break.
                    return 2

                Correct.

                Now, test with: 1+2*3-4

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 1
                            while current token is '*' or '/'? current token is '+', so break.
                            return 1
                    while current token is '+' or '-': 
                         op = '+', consume
                         right = parseTerm() -> 
                              parseTerm:
                                 left = parseFactor() -> 2
                                 current token is '*', so consume
                                 right = parseFactor() -> 3
                                 left = 2*3 = 6
                              return 6
                         left = 1+6 = 7
                    while current token is '+' or '-': 
                         op = '-', consume
                         right = parseTerm() -> 
                              parseTerm:
                                 left = parseFactor() -> 4
                                 while current token is '*' or '/'? no, so break.
                                 return 4
                         left = 7-4 = 3

                Correct.

                Now, test with parentheses: (1+2)*3

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 
                                 '(' -> consume
                                 parseExpression:
                                    left = parseTerm() -> 1
                                    while current token is '+' or '-': 
                                         op = '+', consume
                                         right = parseTerm() -> 2
                                         left = 1+2 = 3
                                 consume ')'
                                 return 3
                            while current token is '*' or '/'? current token is '*', so consume
                            right = parseFactor() -> 3
                            left = 3*3 = 9
                    while current token is '+' or '-': no, so break.
                    return 9

                Correct.

                Now, test with nested parentheses: (1+(2*3))

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 
                                 '(' -> consume
                                 parseExpression:
                                    left = parseTerm() -> 1
                                    while current token is '+' or '-': 
                                         op = '+', consume
                                         right = parseTerm() -> 
                                              parseTerm:
                                                 left = parseFactor() -> 
                                                      '(' -> consume
                                                      parseExpression:
                                                         left = parseTerm() -> 2
                                                         while current token is '*' or '/'? current token is '*', so consume
                                                         right = parseFactor() -> 3
                                                         left = 2*3 = 6
                                                      consume ')'
                                                      return 6
                                                 while current token is '*' or '/'? no, so break.
                                                 return 6
                                         left = 1+6 = 7
                                 consume ')'
                                 return 7
                    while current token is '+' or '-'? no, so break.
                    return 7

                Correct.

                Now, test with unary after right parenthesis: (1+2)-3

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 
                                 '(' -> consume
                                 parseExpression:
                                    left = parseTerm() -> 1
                                    while current token is '+' or '-': 
                                         op = '+', consume
                                         right = parseTerm() -> 2
                                         left = 1+2 = 3
                                 consume ')'
                                 return 3
                            while current token is '*' or '/'? current token is '-', but '-' is not in ('*','/'), so break.
                            return 3
                    while current token is '+' or '-': 
                         op = '-', consume
                         right = parseTerm() -> 
                              parseTerm:
                                 left = parseFactor() -> 3
                                 while current token is '*' or '/'? no, so break.
                                 return 3
                         left = 3-3 = 0

                Correct.

                Now, test with unary after right parenthesis in a multiplication: (1+2)*-3

                  parseExpression:
                    left = parseTerm() -> 
                         parseTerm:
                            left = parseFactor() -> 
                                 '(' -> consume
                                 parseExpression:
                                    left = parseTerm() -> 1
                                    while current token is '+' or '-': 
                                         op = '+', consume
                                         right = parseTerm() -> 2
                                         left = 1+2 = 3
                                 consume ')'
                                 return 3
                            while current token is '*' or '/'? current token is '*', so consume
                            right = parseFactor() -> 
                                 unary - -> 
                                    Factor: number 3 -> 3
                                 -> -3
                            left = 3 * -3 = -9
                    while current token is '+' or '-': no, so break.
                    return -9

                Correct.

                Now, test with unary plus: +1

                  parseFactor:
                    unary + -> 
                      Factor: number 1 -> 1
                    -> 1

                Correct.

                Now, test with multiple unary: -+1

                  parseFactor:
                    unary - -> 
                      Factor: 
                         unary + -> 
                            Factor: number 1 -> 1
                         -> 1
                    -> -1

                Correct.

                Now, test with: 1 - - 2

                  parseExpression:
                    left = parseTerm() -> 1
                    while current token is '+' or '-': 
                         op = '-', consume
                         right = parseTerm() -> 
                              parseTerm:
                                 left = parseFactor() -> 
                                      unary - -> 
                                         Factor: number 2 -> 2
                                      -> -2
                                 while current token is '*' or '/'? no, so break.
                                 return -2
                         left = 1 - (-2) = 3

                Correct.

                Now, test with: 1+2+3

                  parseExpression:
                    left = parseTerm() -> 1
                    while current token is '+' or '-': 
                         op = '+', consume
                         right = parseTerm() -> 2
                         left = 1+2 = 3
                    while current token is '+' or '-': 
                         op = '+', consume
                         right = parseTerm() -> 3
                         left = 3+3 = 6

                Correct.

                Now, test with: 1*2*3

                  parseTerm:
                    left = parseFactor() -> 1
                    while current token is '*' or '/'? 
                         op = '*', consume
                         right = parseFactor() -> 2
                         left = 1*2 = 2
                    while current token is '*' or '/'? 
                         op = '*', consume
                         right = parseFactor() -> 3
                         left = 2*3 = 6

                Correct.

                Now, test with division: 10/3 -> 3 (truncates toward zero)

                  parseTerm:
                    left = parseFactor() -> 10
                    while current token is '*' or '/'? 
                         op = '/', consume
                         right = parseFactor() -> 3
                         left = 10/3 = 3   (using integer division truncating toward zero)

                Correct.

                Now, test with:
