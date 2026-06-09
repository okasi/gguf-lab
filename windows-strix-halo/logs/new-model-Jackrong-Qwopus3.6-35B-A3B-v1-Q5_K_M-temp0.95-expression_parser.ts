import * as fs from 'fs';

    function main() {
        const input = fs.readFileSync(0, "utf8").trim();
        const tokens = tokenize(input);
        const postfix = toPostfix(tokens);
        const result = evaluatePostfix(postfix);
        console.log(result);
    }

    // ... tokenize function ...
    // ... toPostfix function ...
    // ... evaluatePostfix function ...
