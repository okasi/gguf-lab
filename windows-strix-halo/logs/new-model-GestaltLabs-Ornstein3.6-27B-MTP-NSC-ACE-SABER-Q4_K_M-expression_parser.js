"use strict";
const output = [];
const ops = [];
for (const token of tokens) {
    if (token.type === 'num') {
        output.push(token);
    }
    else if (token.type === 'paren') {
        if (token.value === '(') {
            ops.push(token);
        }
        else {
            while (ops.length > 0 && ops[ops.length - 1].value !== '(') {
                output.push(ops.pop());
            }
            ops.pop(); // discard '('
        }
    }
    else if (token.type === 'op') {
        const prec = getPrecedence(token);
        const assoc = token.isUnary ? 'right' : 'left';
        while (ops.length > 0 && ops[ops.length - 1].type === 'op') {
            const topPrec = getPrecedence(ops[ops.length - 1]);
            if ((assoc === 'left' && prec <= topPrec) || (assoc === 'right' && prec < topPrec)) {
                output.push(ops.pop());
            }
            else {
                break;
            }
        }
        ops.push(token);
    }
}
while (ops.length > 0) {
    output.push(ops.pop());
}
