"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function solve() {
    const data = fs_1.default.readFileSync(0, "utf8");
    const lines = data.trim().split('\n');
    const [C, N] = lines[0].split(' ').map(Number);
    const getOps = [];
    const keys = new Map();
    const lruOrder = [];
    let lruIndex = 0;
    for (let i = 1; i <= N; i++) {
        const parts = lines[i].trim().split(' ');
        const op = parts[0];
        const key = parts[1];
        const val = parseInt(parts[2]) || 0;
        if (op === 'GET') {
            getOps.push(key);
            if (keys.has(key)) {
                const entry = keys.get(key);
                entry.order++;
                const idx = lruOrder.indexOf(entry.order);
                if (idx > -1) {
                    lruOrder.splice(idx, 1);
                    lruOrder.push(entry.order);
                }
            }
        }
        else if (op === 'PUT') {
            if (keys.has(key)) {
                const entry = keys.get(key);
                entry.val = val;
                entry.order++;
                const idx = lruOrder.indexOf(entry.order);
                if (idx > -1) {
                    lruOrder.splice(idx, 1);
                    lruOrder.push(entry.order);
                }
            }
            else {
                if (keys.size >= C) {
                    const lruVal = lruOrder.shift();
                    const lruKey = lruOrder.indexOf(lruVal);
                    lruOrder.splice(lruKey, 1);
                    keys.delete(lruOrder[lruKey]);
                }
                keys.set(key, { val, order: lruOrder.length });
                lruOrder.push(lruOrder.length);
            }
        }
        else if (op === 'DEL') {
            if (keys.has(key)) {
                const entry = keys.get(key);
                const idx = lruOrder.indexOf(entry.order);
                if (idx > -1) {
                    lruOrder.splice(idx, 1);
                }
                keys.delete(key);
            }
        }
    }
    const getResults = getOps.map(k => keys.has(k) ? keys.get(k).val : -1);
    const sortedKeys = lruOrder.map(() => {
        const key = keys.keys().next().value;
        return key;
    }).filter(() => keys.has(key));
    const result1 = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const result2 = sortedKeys.length > 0 ? sortedKeys.join(' ') : 'EMPTY';
    console.log(result1);
    console.log(result2);
}
solve();
