import * as fs from 'fs';

function solve(): void {
    let input: string;
    try {
        input = fs.readFileSync(0, "utf8");
    } catch (e) {
        return;
    }
    if (!input) return;

    interface Token {
        type: string;
        value?: number;
    }

    const tokens: Token[] = [];
    let idx = 0;

    while (idx < input.length) {
        const char = input[idx];
        if (/\s/.test(char)) {
            idx++;
            continue;
        }
        if (/\d/.test(char)) {
            let numStr = "";
            while (idx < input.length && /\d/.test(input[idx])) {
                numStr += input[idx];
                idx++;
            }
            tokens.push({ type: 'NUM', value: parseInt(numStr, 10) });
        } else {
            tokens.push({ type: char });
            idx++;
        }
    }

    let current = 0;

    function parseExpression(): number {
        let node = parseTerm();
        while (current < tokens.length && (tokens[current].type === '+' || tokens[current].type === '-')) {
            const op = tokens[current].type;
            current++;
            const right = parseTerm();
            if (op === '+') node += right;
            else node -= right;
        }
        return node;
    }

    function parseTerm(): number {
        let node = parseUnary();
        while (current < tokens.length && (tokens[current].type === '*' || tokens[current].type === '/')) {
            const op = tokens[current].type;
            current++;
            const right = parseUnary();
            if (op === '*') {
                node *= right;
            } else {
                node = Math.trunc(node / right);
            }
        }
        return node;
    }

    function parseUnary(): number {
        if (current < tokens.length && tokens[current].type === '+') {
            current++;
            return parseUnary();
        }
        if (current < tokens.length && tokens[current].type === '-') {
            current++;
            return -parseUnary();
        }
        return parsePrimary();
    }

    function parsePrimary(): number {
        if (current >= tokens.length) return 0;
        const token = tokens[current];
        if (token.type === 'NUM') {
            current++;
            return token.value!;
        } else if (token.type === '(') {
            current++;
            const val = parseExpression();
            if (current < tokens.length && tokens[current].type === ')') {
                current++;
            }
            return val;
        }
        return 0;
    }

    const result = parseExpression();
    process.stdout.write(result.toString() + '\n');
}

solve();
