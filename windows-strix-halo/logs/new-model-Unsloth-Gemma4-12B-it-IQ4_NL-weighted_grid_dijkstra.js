"use strict";
const input = fs.readFileSync(0, "utf8");
const lines = input.split(/\r?\n/);
const [H, W] = lines[0].trim().split(/\s+/).map(Number);
const grid = lines.slice(1).filter(l => l.trim().length > 0).slice(0, H).map(l => l.trim().split(''));
