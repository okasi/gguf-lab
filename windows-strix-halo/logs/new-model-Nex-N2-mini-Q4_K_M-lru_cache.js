"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const input = fs_1.default.readFileSync(0, "utf8").trim();
const lines = input.split(/\r?\n/);
const [capacityText, operationCountText] = lines[0].split(/\s+/);
const capacity = Number(capacityText);
const operationCount = Number(operationCountText);
const cache = new Map();
const getResults = [];
for (let i = 1; i <= operationCount; i += 1) {
    const parts = lines[i].split(/\s+/);
    const command = parts[0];
    if (command === "GET") {
        const key = parts[1];
        const value = cache.get(key);
        if (value === undefined) {
            getResults.push("-1");
        }
        else {
            cache.delete(key);
            cache.set(key, value);
            getResults.push(String(value));
        }
    }
    else if (command === "PUT") {
        const key = parts[1];
        const value = Number(parts[2]);
        cache.delete(key);
        cache.set(key, value);
        while (cache.size > capacity) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }
    }
    else if (command === "DEL") {
        cache.delete(parts[1]);
    }
}
const remainingKeys = [...cache.keys()];
process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
process.stdout.write(remainingKeys.length > 0 ? remainingKeys.join(" ") + "\n" : "EMPTY\n");
