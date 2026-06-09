"use strict";
const queries = [];
let count = 0;
for (let i = N + 1; i < lines.length && count < Q; i++) {
    const nums = lines[i].split(/\s+/).map(Number);
    for (const num of nums) {
        if (count < Q) {
            queries.push(num);
            count++;
        }
    }
}
