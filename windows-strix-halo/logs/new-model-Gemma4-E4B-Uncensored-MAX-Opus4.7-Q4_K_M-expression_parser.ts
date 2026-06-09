import * as fs from 'fs';

/**
 * A token type that represents a number, an operator, or a parenthesis.
 * We use a string wrapper to preserve type information.
 */
type Token = { type: 'number' | 'operator' | 'parenthesis'; value: string };

/**
 * Consumes tokens from the stream, returning the next token.
 * @param tokens The list of tokens.
 * @param currentIndex The current reading position.
 * @returns The next token and the new index.
 */
function getNextToken(tokens: Token[], currentIndex: number): [Token, number] {
    if (currentIndex >= tokens.length) {
        throw new Error('Unexpected end of expression.');
    }
    return [tokens[currentIndex], currentIndex + 1];
}

/**
 * Checks if a token is a number.
 * @param token The token string.
 * @returns true if the token represents a valid number.
 */
function isNumber(token: Token): boolean {
    return !isNaN(Number(token.value)) && token.type !== 'operator' && token.type !== 'parenthesis';
}

/**
 * Checks if a token is a binary operator.
 * @param token The token string.
 * @returns true if the token is an operator.
 */
function isOperator(token: Token): boolean {
    return token.type === 'operator';
}

/**
 * Applies unary + or - to the current value.
 * @param token The token immediately following the unary operator.
 * @param currentStartIndex The index where the unary operator was found.
 * @param tokens The list of tokens.
 * @param currentIndex The index of the unary operator.
 * @returns The resulting number and the new starting index.
 */
function applyUnary(tokens: Token[], currentIndex: number, currentStartIndex: number): number {
    const nextToken = tokens[currentIndex + 1];
    if (!nextToken || !isNumber(nextToken)) {
        throw new Error(`Expected number after unary operator '${tokens[currentIndex].value}'`);
    }

    const num = Number(nextToken.value);

    if (tokens[currentIndex].value === '+' || tokens[currentIndex].value === '') {
        return num;
    }
    
    // Handle explicit unary minus or leading minus
    return num * -1;
}

/**
 * Applies a binary operator to two numbers.
 * @param op The operator.
 * @param left The left operand.
 * @param right The right operand.
 * @returns The result.
 */
function applyBinary(op: string, left: number, right: number): number {
    switch (op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': 
            // Integer division truncates toward zero, matching C-style behavior
            return Math.trunc(left / right); 
        default: throw new Error(`Unknown operator: ${op}`);
    }
}


/**
 * Recursively evaluates a sub-expression using operator precedence rules.
 * 1. Unary (+/-)
 * 2. Primary (Parentheses)
 * 3. Multiplication/Division (*, /)
 * 4. Addition/Subtraction (+, -)
 * 
 * @param tokens The token array.
 * @param currentIndex The index from which to start parsing.
 * @returns [evaluated result, next index]
 */
function evaluate(tokens: Token[], currentIndex: number): [number, number] {
    let result: number | undefined = undefined;
    let currentOp: string | undefined = undefined;
    let currentStartIndex = currentIndex;

    while (currentIndex < tokens.length) {
        const token = tokens[currentIndex];

        // --- Unary/Primary/Number ---
        if (isNumber(token)) {
            const num = Number(token.value);
            let effectiveNum: number = num;
            
            // Check if the number is the start of an expression 
            // or immediately follows an opening parenthesis
            const isStartOrAfterOpen = (currentIndex === 0) || 
                                       (tokens[currentIndex - 1] as Token).type === 'parenthesis' && 
                                       tokens[currentIndex - 1].value === '(';
            
            // If it's a number preceded by a sign, apply unary logic
            const prevToken = tokens[currentIndex - 1];
            if (typeof prevToken.value === 'string' && (prevToken.type === 'operator' && prevToken.value === '+' || prevToken.type === 'parenthesis' && prevToken.value === '(') && isStartOrAfterOpen) {
                effectiveNum = applyUnary(tokens, currentIndex - 1, currentStartIndex);
                currentIndex--; // Rewind to process the unary operator itself
            }
            
            result = effectiveNum;
            currentStartIndex = currentIndex + 1;

        } 
        // --- Parentheses (Recursive Call) ---
        else if (token.type === 'parenthesis' && token.value === '(') {
            const [innerResult, nextIndex] = evaluate(tokens, currentIndex + 1);
            result = innerResult;
            currentIndex = nextIndex;
            currentStartIndex = currentIndex;
        }
        // --- Binary Operator ---
        else if (isOperator(token)) {
            // If we already calculated a left-hand side, apply binary op
            if (result !== undefined && currentOp) {
                const left = result!;
                const right = Number(tokens[currentIndex + 1]?.value ?? '0');
                result = applyBinary(currentOp!, left, right);
            } else {
                // No left operand, this operator must be unary
                const nextToken = tokens[currentIndex + 1];
                if (!nextToken || !isNumber(nextToken)) {
                    throw new Error(`Expected expression after unary operator: ${tokens[currentIndex].value}`);
                }
                const nextNum = Number(tokens[currentIndex + 1].value);
                
                let effectiveNum: number;
                const isStartOrAfterOpen = (currentIndex === 0) || 
                                           (tokens[currentIndex - 1] as Token).type === 'parenthesis' && 
                                           tokens[currentIndex - 1].value === '(';
                
                if (tokens[currentIndex].value === '+' || tokens[currentIndex].value === '') {
                    effectiveNum = nextNum;
                } else {
                    effectiveNum = nextNum * -1;
                }
                result = effectiveNum;
            }
            
            currentOp = token.value;
            currentIndex++;
            currentStartIndex = currentIndex;
        }
        // --- Whitespace / Separator (Skip) ---
        else if (token.type === 'parenthesis' && token.value === ')') {
            // End of recursive evaluation block
            return [result!, currentIndex + 1];
        } else if (token.type === 'parenthesis' && token.value === undefined) {
            // Should not happen if tokenizer is correct
            throw new Error(`Unexpected token: ${tokens[currentIndex].value}`);
        }
        // If nothing happened, we just advance the index
        else {
            currentIndex++;
        }
    }

    // After loop, apply the last stored operation if it was binary
    if (currentOp !== undefined && result !== undefined) {
        const left = result!;
        const right = Number(tokens[currentIndex]?.value ?? '0');
        return [applyBinary(currentOp, left, right), currentIndex];
    }

    throw new Error('Empty or invalid expression');
}

/**
 * Splits the raw input string into meaningful tokens.
 * @param input The raw string.
 * @returns An array of Token objects.
 */
function tokenize(input: string): Token[] {
    // Regex captures: numbers, whitespace, parentheses, operators, identifiers (just in case)
    // Group 1: numbers
    // Group 2: parentheses
    // Group 3: operators
    const tokenRegex = /(\d+)|(\(|\))|([\+\-\*/])|\s+/g;
    const tokens: Token[] = [];
    
    let match: RegExpExecArray | null = tokenRegex.exec(input);

    while (match) {
        const [fullMatch, num, paren, op] = match;
        
        if (num) {
            tokens.push({ type: 'number', value: num });
        } else if (paren) {
            tokens.push({ type: 'parenthesis', value: paren });
        } else if (op) {
            tokens.push({ type: 'operator', value: op });
        } else {
            // Should not happen if regex is correct
            console.error(`[Tokenizer] Warning: unhandled match: ${fullMatch}`);
        }
        
        tokenRegex.lastIndex = match.index + fullMatch.length;
    }
    return tokens;
}


function main() {
    const input = process.argv[2];
    if (!input) {
        console.error('Usage: ts-node <filename> "expression"');
        process.exit(1);
    }

    try {
        console.log(evaluate(tokenize(input))[0].toString());
    } catch (e) {
        console.error(`Error evaluating expression: ${e.message}`);
        process.exit(1);
    }
}

main();
// Example Usage: node ts-node -- src/index.ts '1 + 2 * (3 - 4) / 5 + 7'
// Expected output: 1
// Example: node ts-node -- src/index.ts '-(3 + 4) * 2'  -> -14
// Example: node ts-node -- src/index.ts '5 + -2' -> 7
// Example: node ts-node -- src/index.ts '((1 + 2) * 3) / 4' -> 2
// Example: node ts-node -- src/index.ts '1 * (2 + 3) / 5' -> 1
```
