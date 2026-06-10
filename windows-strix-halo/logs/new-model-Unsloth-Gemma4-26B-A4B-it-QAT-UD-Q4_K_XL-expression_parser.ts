import * as fs from 'fs';

/**
 * Implementation of the Shunting-Yard algorithm to convert infix to postfix
 * and then evaluate the postfix expression.
 */

enum TokenType {
    Number,
    Plus,
    Minus,
    Multiply,
    Divide,
    LParen,
    RParen,
    UnaryPlus,
    UnaryMinus
}

interface Token {
    type: TokenType;
    value?: number;
}

function tokenize(str: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < str.length) {
        const char = str[i];

        if (/\s/.test(char)) {
            i++;
            continue;
        }

        if (/\d/.test(char)) {
            let numStr = '';
            while (i < str.length && /\d/.test(str[i])) {
                numStr += str[i];
                i++;
            }
            tokens.push({ type: TokenType.Number, value: parseInt(numStr, 10) });
            continue;
        }

        switch (char) {
            case '+': tokens.push({ type: TokenType.Plus }); break;
            case '-': tokens.push({ type: TokenType.Minus }); break;
            case '*': tokens.push({ type: TokenType.Multiply }); break;
            case '/': tokens.push({ type: TokenType.Divide }); break;
            case '(': tokens.push({ type: TokenType.LParen }); break;
            case ')': tokens.push({ type: TokenType.RParen }); break;
            default: throw new Error(`Unknown character: ${char}`);
        }
        i++;
    }
    return tokens;
}

function parseTokens(tokens: Token[]): Token[] {
    const processed: Token[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const prev = processed[processed.length - 1];

        if (token.type === TokenType.Plus || token.type === TokenType.Minus) {
            // Check if this is a unary operator
            // It is unary if it's at the start or preceded by an operator or '('
            const isUnary = !prev || prev.type === TokenType.Plus || 
                            prev.type === TokenType.Minus || 
                            prev.type === TokenType.Multiply || 
                            prev.type === TokenType.Divide || 
                            prev.type === TokenType.LParen;

            if (isUnary) {
                processed.push({ type: token.type === TokenType.Plus ? TokenType.UnaryPlus : TokenType.UnaryMinus });
                continue;
            }
        }
        processed.push(token);
    }
    return processed;
}

function evaluate(tokens: Token[]): number {
    const outputQueue: number[] = [];
    const operatorStack: Token[] = [];

    const precedence: Record<TokenType, number> = {
        [TokenType.UnaryPlus]: 3,
        [TokenType.UnaryMinus]: 3,
        [TokenType.Multiply]: 2,
        [TokenType.Divide]: 2,
        [TokenType.Plus]: 1,
        [TokenType.Minus]: 1,
        [TokenType.Number]: 0,
        [TokenType.LParen]: 0,
        [TokenType.RParen]: 0
    };

    const isUnary = (t: Token) => t.type === TokenType.UnaryPlus || t.type === TokenType.UnaryMinus;

    for (const token of tokens) {
        if (token.type === TokenType.Number) {
            outputQueue.push(token.value!);
        } else if (token.type === TokenType.LParen) {
            operatorStack.push(token);
        } else if (token.type === TokenType.RParen) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                applyOperator(operatorStack.pop()!, outputQueue);
            }
            operatorStack.pop(); // Remove LParen
        } else {
            // Operator
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === TokenType.LParen) break;

                const p1 = precedence[token.type];
                const p2 = precedence[top.type];

                // Unary operators are right-associative in logic here (high precedence)
                if (isUnary(token)) {
                    if (p1 < p2) applyOperator(operatorStack.pop()!, outputQueue);
                    else break;
                } else {
                    if (p1 <= p2) applyOperator(operatorStack.pop()!, outputQueue);
                    else break;
                }
            }
            operatorStack.push(token);
        }
    }

    while (operatorStack.length > 0) {
        applyOperator(operatorStack.pop()!, outputQueue);
    }

    return outputQueue[0];
}

function applyOperator(token: Token, stack: number[]) {
    if (token.type === TokenType.UnaryPlus) {
        stack.push(stack.pop()!);
    } else if (token.type === TokenType.UnaryMinus) {
        stack.push(-stack.pop()!);
    } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.type) {
            case TokenType.Plus: stack.push(a + b); break;
            case TokenType.Minus: stack.push(a - b); break;
            case TokenType.Multiply: stack.push(a * b); break;
            case TokenType.Divide: 
                const res = a / b;
                stack.push(res >= 0 ? Math.trunc(res) : Math.ceil(res)); 
                // Note: Math.trunc handles "truncate toward zero" for all numbers
                // but since we are dealing with safe integers, standard truncation is:
                // stack.push(a / b | 0); // This works for 32-bit, but for safe integers:
                // stack.push(Math.trunc(a / b));
                break;
            default: throw new Error("Invalid operator");
        }
    }
}

// Re-implementing applyOperator specifically for safe integer truncation
function applyOperatorCorrect(token: Token, stack: number[]) {
    if (token.type === TokenType.UnaryPlus) {
        stack.push(stack.pop()!);
    } else if (token.type === TokenType.UnaryMinus) {
        stack.push(-stack.pop()!);
    } else {
        const b = stack.pop()!;
        const a = stack.pop()!;
        switch (token.type) {
            case TokenType.Plus: stack.push(a + b); break;
            case TokenType.Minus: stack.push(a - b); break;
            case TokenType.Multiply: stack.push(a * b); break;
            case TokenType.Divide: {
                const res = a / b;
                stack.push(Math.trunc(res));
                break;
            }
            default: throw new Error("Invalid operator");
        }
    }
}

// Fix the loop to use the correct apply function
function evaluateFixed(tokens: Token[]): number {
    const outputQueue: number[] = [];
    const operatorStack: Token[] = [];
    const precedence: Record<TokenType, number> = {
        [TokenType.Number]: 0,
        [TokenType.Plus]: 1,
        [TokenType.Minus]: 1,
        [TokenType.Multiply]: 2,
        [TokenType.Divide]: 2,
        [TokenType.UnaryPlus]: 3,
        [TokenType.UnaryMinus]: 3,
        [TokenType.LParen]: 0,
        [TokenType.RParen]: 0
    };

    for (const token of tokens) {
        if (token.type === TokenType.Number) {
            outputQueue.push(token.value!);
        } else if (token.type === TokenType.LParen) {
            operatorStack.push(token);
        } else if (token.type === TokenType.RParen) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                applyOperatorCorrect(operatorStack.pop()!, outputQueue);
            }
            operatorStack.pop();
        } else {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                const top = operatorStack[operatorStack.length - 1];
                const pTop = precedence[top.type];
                const pCurr = precedence[token.type];
                
                // If current is unary, it has higher precedence than everything except other unaries.
                // Standard shunting yard: if current is left-assoc and pCurr <= pTop, pop.
                // Unary is right-assoc.
                const isCurrUnary = token.type === TokenType.UnaryPlus || token.type === TokenType.UnaryMinus;
                if (!isCurrUnary && pCurr <= pTop) {
                    applyOperatorCorrect(operatorStack.pop()!, outputQueue);
                } else if (isCurrUnary && pCurr < pTop) {
                    applyOperatorCorrect(operatorStack.pop()!, outputQueue);
                } else {
                    break;
                }
            }
            operatorStack.push(token);
        }
    }
    while (operatorStack.length > 0) {
        applyOperatorCorrect(operatorStack.pop()!, outputQueue);
    }
    return outputQueue[0];
}

function main() {
    const input = fs.readFileSync(0, "utf8");
    if (!input.trim()) return;
    const tokens = parseTokens(tokenize(input));
    console.log(evaluateFixed(tokens).toString());
}

main();
