"use strict";
const input = fs.readFileSync(0, "utf8").split(/\r?\n/);
let lineIdx = 0;
const firstLine = input[lineIdx++].trim().split(/\s+/ / );
const H = parseInt(firstLine[0]);
const W = parseInt(firstLine[1]);
const grid = [];
for (let i = 0; i < H; i++) {
    grid.push(input[lineIdx++].trim());
}
