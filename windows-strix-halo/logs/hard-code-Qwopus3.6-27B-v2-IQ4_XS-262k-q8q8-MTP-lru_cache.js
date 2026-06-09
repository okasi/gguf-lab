"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.keys = [];
        this.keyIndex = new Map();
    }
    put(key, value) {
        if (this.keyIndex.has(key)) {
            this.map.set(key, value);
            this.moveToFront(key);
        }
        else {
            if (this.keys.length >= this.capacity) {
                const evicted = this.keys.pop();
                this.keyIndex.delete(evicted);
                this.map.delete(evicted);
            }
            this.keys.unshift(key);
            this.keyIndex.set(key, 0);
            this.map.set(key, value);
            this.rebuildIndices();
        }
    }
    get(key) {
        if (!this.keyIndex.has(key)) {
            return undefined;
        }
        this.moveToFront(key);
        return this.map.get(key);
    }
    del(key) {
        if (!this.keyIndex.has(key)) {
            return;
        }
        const index = this.keyIndex.get(key);
        this.keys.splice(index, 1);
        this.keyIndex.delete(key);
        this.map.delete(key);
        this.rebuildIndices();
    }
    getKeysMRUtoLRU() {
        return [...this.keys];
    }
    moveToFront(key) {
        const index = this.keyIndex.get(key);
        if (index === 0) {
            return;
        }
        this.keys.splice(index, 1);
        this.keys.unshift(key);
        this.rebuildIndices();
    }
    rebuildIndices() {
        this.keyIndex.clear();
        for (let i = 0; i < this.keys.length; i++) {
            this.keyIndex.set(this.keys[i], i);
        }
    }
}
function main() {
    const input = fs_1.default.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(" ");
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.split(" ");
        const op = parts[0];
        const key = parts[1];
        if (op === "PUT") {
            const value = parts[2];
            cache.put(key, value);
        }
        else if (op === "GET") {
            const result = cache.get(key);
            if (result !== undefined) {
                getResults.push(result);
            }
            else {
                getResults.push("-1");
            }
        }
        else if (op === "DEL") {
            cache.del(key);
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
    const keys = cache.getKeysMRUtoLRU();
    const keysOutput = keys.length > 0 ? keys.join(" ") : "EMPTY";
    console.log(getOutput);
    console.log(keysOutput);
}
main();
