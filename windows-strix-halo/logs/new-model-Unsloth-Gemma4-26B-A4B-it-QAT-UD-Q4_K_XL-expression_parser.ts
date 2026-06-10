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

function parseToPostfix(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    // Precedence map
    const precedence: Record<string, number> = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
        'u+': 3, // Unary plus
        'u-': 3  // Unary minus
    };

    // Helper to check if token is a binary operator
    const isBinaryOp = (t: Token) => 
        t.type === TokenType.Plus || t.type === TokenType.Minus || 
        t.type === TokenType.Multiply || t.type === TokenType.Divide;

    // Process tokens and handle unary operators
    const processedTokens: Token[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const current = tokens[i];
        const prev = i > 0 ? tokens[i - 1] : null;

        if (current.type === TokenType.Plus || current.type === TokenType.Minus) {
            // If token is + or - and it's at start or follows another operator or '('
            // then it is a unary operator.
            const isUnary = !prev || 
                prev.type === TokenType.Plus || 
                prev.type === TokenType.Minus || 
                prev.type === TokenType.Multiply || 
                prev.type === TokenType.Divide || 
                prev.type === TokenType.LParen;

            if (isUnary) {
                if (current.type === TokenType.Plus) {
                    processedTokens.push({ type: TokenType.UnaryPlus });
                } else {
                    processedTokens.push({ type: TokenType.UnaryMinus });
                }
                continue;
            }
        }
        processedTokens.push(current);
    }

    for (const token of processedTokens) {
        if (token.type === TokenType.Number) {
            outputQueue.push(token);
        } else if (token.type === TokenType.LParen) {
            operatorStack.push(token);
        } else if (token.type === TokenType.RParen) {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== TokenType.LParen) {
                outputQueue.push(operatorStack.pop()!);
            }
            operatorStack.pop(); // Remove '('
        } else {
            // It's an operator
            const opMap: Record<TokenType, string> = {
                [TokenType.Plus]: '+',
                [TokenType.Minus]: '-',
                [TokenType.Multiply]: '*',
                [TokenType.Divide]: '/',
                [TokenType.UnaryPlus]: 'u+',
                [TokenType.UnaryMinus]: 'u-',
                [TokenType.LParen]: '(',
                [TokenType.RParen]: ')',
                [TokenType.Number]: ''
            };

            const opType = opMap[token.type];
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type === TokenType.LParen) break;
                
                const topOp = opMap[top.type];
                // Unary operators have higher precedence and are right-associative in standard math,
                // but here they are simple single-operand.
                if (precedence[topOp!] >= precedence[opType!]) {
                    outputQueue.push(operatorStack.pop()!);
                } else {
                    break;
                }
            }
            operatorStack.push(token);
        }
    }

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop()!);
    }

    return outputQueue;
}

function evaluatePostfix(postfix: Token[]): number {
    const stack: number[] = [];

    for (const token of postfix) {
        if (token.type === TokenType.Number) {
            stack.push(token.value!);
        } else if (token.type === TokenType.UnaryPlus) {
            // No-op for integer math
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
                    // Truncate towards zero
                    const res = a / b;
                    stack.push(res >= 0 ? Math.floor(res) : Math.ceil(res));
                    break;
            }
        }
    }

    return stack[0];
}

function main() {
    const input = fs.readFileSync(0, "utf8");
    if (!input.trim()) return;
    
    const tokens = tokenize(input);
    const postfix = parseToPostfix(tokens);
    const result = evaluatePostfix(postfix);
    process.stdout.write(result.toString() + "\n");
}

main();
