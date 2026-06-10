"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function createNode(key, value) {
    return { key, value, prev: null, next: null };
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = createNode("", 0);
        this.tail = createNode("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    removeFromList(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    addToFront(node) {
        const oldFirst = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = oldFirst;
        oldFirst.prev = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }
        if (this.size >= this.capacity) {
            this.evictLRU();
        }
        const node = createNode(key, value);
        this.map.set(key, node);
        this.addToFront(node);
        this.size++;
    }
    delete(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeFromList(node);
            this.map.delete(key);
            this.size--;
        }
    }
    moveToFront(node) {
        this.removeFromList(node);
        this.addToFront(node);
    }
    evictLRU() {
        const lru = this.tail.prev;
        if (lru === this.head) {
            return;
        }
        this.removeFromList(lru);
        this.map.delete(lru.key);
        this.size--;
    }
    getKeys() {
        const result = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
function main() {
    const input = fs_1.default.readFileSync(0, "utf8").trim();
    if (!input) {
        console.log("EMPTY");
        console.log("EMPTY");
        return;
    }
    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const op = parts[0].toUpperCase();
        if (op === "PUT" && parts.length >= 3) {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === "GET" && parts.length >= 2) {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (op === "DEL" && parts.length >= 2) {
            const key = parts[1];
            cache.delete(key);
        }
    }
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    const remainingKeys = cache.getKeys();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(" "));
    }
}
main();
