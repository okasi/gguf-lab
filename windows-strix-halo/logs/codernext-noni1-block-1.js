"use strict";
const rawInput = fs.readFileSync(0, "utf8");
const lines = rawInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
let pointer = 0;
const [nStr, qStr] = lines[pointer++].split(/\s+/).map(Number);
const N = nStr;
const Q = qStr;
const intervals = [];
for (let i = 0; i < N; i++) {
    const [l, r] = lines[pointer++].split(/\s+/).map(Number);
    intervals.push([l, r]);
}
// The rest of the lines belong to the query points.
// Usually they are on one line, but could span multiple if Q is huge?
// Constraint: Q <= 200000. A line can hold ~200k ints easily.
// But to be safe, consume remaining lines.
const queryPoints = [];
while (pointer < lines.length) {
    const nums = lines[pointer++].split(/\s+/).map(Number);
    queryPoints.push(...nums);
}
// Validate Q vs queryPoints.length? 
// Problem says "Last line: Q integers". 
// If there are more, ignore? If less, error?
// Assuming valid input per spec.
