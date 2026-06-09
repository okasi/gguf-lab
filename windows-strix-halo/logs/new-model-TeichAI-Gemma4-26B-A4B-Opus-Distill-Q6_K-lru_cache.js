"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class LRUCache {
    constructor(capacity) {
        this.size = 0;
        this.map = new Map();
        this.capacity = capacity;
        this.head = { key: "", value: 0, prev: null, next: null };
        this.tail = { key: "", value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    addToHead(node) {
        const next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
        node.next = next;
        next.prev = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        }
        else {
            if (this.size === this.capacity && this.capacity > 0) {
                const lru = this.tail.prev;
                if (lru !== this.head) {
                    this.removeNode(lru);
                    this.map.delete(lru.key);
                    this.size--;
                }
            }
            if (this.size < this.capacity) {
                const newNode = { key, value, prev: null, next: null };
                this.addToHead(newNode);
                this.map.set(key, newNode);
                this.size++;
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            if (curr && curr !== this.head && curr !== this.tail) {
                keys.push(curr.key);
            }
            curr = curr.next;
        }
        return keys;
    }
}
function solve() {
    const input = fs_1.default.readFileSync(0, "utf8");
    let pos = 0;
    function nextToken() {
        while (pos < input.length && input[pos] <= ' ')
            pos++;
        if (pos >= input.length)
            return null;
        let start = pos;
        while (pos < input.length && input[pos] > ' ')
            pos++;
        return input.slice(start, pos);
    }
    const cStr = nextToken();
    const nStr = nextToken();
    if (cStr === null || nStr === null)
        return;
    const C = parseInt(cStr);
    const N = parseInt(nStr);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const op = nextToken();
        if (!op)
            break;
        if (op === 'PUT') {
            const key = nextToken();
            const valStr = nextToken();
            if (key && valStr)
                cache.put(key, parseInt(valStr));
        }
        else if (op === 'GET') {
            const key = nextToken();
            if (key)
                getResults.push(cache.get(key));
        }
        else if (op === 'DEL') {
            const key = nextToken();
            if (key)
                cache.del(key);
        }
    }
    process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
    const keys = cache.getKeys();
    process.stdout.write(keys.length > 0 ? keys.join(" ") + "\n" : "EMPTY\n");
}
solve();
