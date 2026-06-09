import * as fs from 'fs';

type TokenType = 'Number' | 'UnaryPlus' | 'UnaryMinus' | 'Add' | 'Sub' | 'Mul' | 'Div' | 'LParen' | 'RParen';

interface Token {
    type: TokenType;
    value?: number;
}

function tokenize(s: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === ' ') {
            i++;
            continue;
        }
        if (c >= '0' && c <= '9') {
            let num = 0;
            while (i < s.length && s[i] >= '0' && s[i] <= '9') {
                num = num * 10 + (s[i] - '0');
                i++;
            }
            tokens.push({ type: 'Number', value: num });
            continue;
        }
        if (c === '(') {
            tokens.push({ type: 'LParen' });
            i++;
            continue;
        }
        if (c === ')') {
            tokens.push({ type: 'RParen' });
            i++;
            continue;
        }
        if (c === '*') {
            tokens.push({ type: 'Mul' });
            i++;
            continue;
        }
        if (c === '/') {
            tokens.push({ type: 'Div' });
            i++;
            continue;
        }
        if (c === '+' || c === '-') {
            let isUnary = false;
            if (tokens.length === 0) {
                isUnary = true;
            } else {
                const last = tokens[tokens.length - 1];
                if (last.type === 'Mul' || last.type === 'Div' || last.type === 'Add' || last.type === 'Sub' || last.type === 'UnaryPlus' || last.type === 'UnaryMinus' || last.type === 'LParen') {
                    isUnary = true;
                }
            }
            if (isUnary) {
                if (c === '+') {
                    tokens.push({ type: 'UnaryPlus' });
                } else {
                    tokens.push({ type: 'UnaryMinus' });
                }
            } else {
                if (c === '+') {
                    tokens.push({ type: 'Add' });
                } else {
                    tokens.push({ type: 'Sub' });
                }
            }
            i++;
            continue;
        }
        // Ignore other characters, though problem says only integers, spaces, parentheses, + - * /
        i++;
    }
    return tokens;
}
