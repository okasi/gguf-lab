"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
// Define a Map data structure to store key-value pairs
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.queue = [];
    }
    // Returns the value if present, otherwise -1. Makes the key most recently used.
    get(key) {
        if (this.map.has(key)) {
            const item = this.map.get(key);
            this.queue = this.queue.filter(k => k !== key);
            this.queue.push(key);
            this.map.set(key, { value: item.value, time: item.time });
            return item.value;
        }
        return -1;
    }
    // Updates an existing key and makes it most recently used. If inserting and the cache is over capacity, evicts the least recently used key.
    put(key, value) {
        if (this.map.has(key)) {
            this.queue = this.queue.filter(k => k !== key);
            this.queue.push(key);
            this.map.set(key, { value: value, time: this.map.get(key).time });
        }
        else {
            if (this.queue.length >= this.capacity) {
                const keyToEvict = this.queue.shift();
                this.map.delete(keyToEvict);
            }
            this.queue.push(key);
            this.map.set(key, { value: value, time: Date.now() });
        }
    }
    // Removes the key if present.
    del(key) {
        if (this.map.has(key)) {
            this.queue = this.queue.filter(k => k !== key);
            this.map.delete(key);
        }
    }
    // Returns the remaining keys from most-recently-used to least-recently-used.
    getRemainingKeys() {
        return this.queue;
    }
}
// Read input
const input = fs_1.default.readFileSync(0, 'utf8').split('\n');
const [capacity, numOperations] = input[0].split(' ').map(Number);
const operations = input.slice(1).map(op => op.split(' '));
// Create LRU cache and process operations
const cache = new LRUCache(capacity);
const getResults = [];
for (const [operation, ...args] of operations) {
    switch (operation) {
        case 'PUT':
            cache.put(args[0], Number(args[1]));
            break;
        case 'GET':
            getResults.push(cache.get(args[0]));
            break;
        case 'DEL':
            cache.del(args[0]);
            break;
    }
}
// Output results
let output = '';
if (getResults.length > 0) {
    output += getResults.join(' ') + '\n';
}
else {
    output += 'EMPTY\n';
}
if (cache.getRemainingKeys().length > 0) {
    output += cache.getRemainingKeys().join(' ') + '\n';
}
else {
    output += 'EMPTY\n';
}
console.log(output);
