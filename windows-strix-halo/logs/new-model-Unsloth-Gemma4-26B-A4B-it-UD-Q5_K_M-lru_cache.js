"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Node {
    constructor(key, value) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    addNodeToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.removeNode(node);
        this.addNodeToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addNodeToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addNodeToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.tail.prev;
                this.removeNode(lru);
                this.map.delete(lru.key);
                this.size--;
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
            if (curr) {
                keys.push(curr.key);
                curr = curr.next;
            }
            else {
                break;
            }
        }
        return keys;
    }
}
class Scanner {
    constructor(input) {
        this.pos = 0;
        this.input = input;
    }
    next() {
        while (this.pos < this.input.length && this.input[this.pos] <= ' ') {
            this.pos++;
        }
        if (this.pos >= this.input.length)
            return null;
        let start = this.pos;
        while (this.pos < this.input.length && this.input[this.pos] > ' ') {
            this.pos++;
        }
        return this.input.substring(start, this.pos);
    }
}
function solve() {
    let input;
    try {
        input = fs.readFileSync(0, "utf8");
    }
    catch (e) {
        return;
    }
    const scanner = new Scanner(input);
    const cStr = scanner.next();
    const nStr = scanner.next();
    if (cStr === null || nStr === null)
        return;
    const C = parseInt(cStr);
    const N = parseInt(nStr);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const op = scanner.next();
        if (op === 'PUT') {
            const key = scanner.next();
            const valStr = scanner.next();
            if (key !== null && valStr !== null) {
                cache.put(key, parseInt(valStr));
            }
        }
        else if (op === 'GET') {
            const key = scanner.next();
            if (key !== null) {
                getResults.push(cache.get(key));
            }
        }
        else if (op === 'DEL') {
            const key = scanner.next();
            if (key !== null) {
                cache.del(key);
            }
        }
    }
    if (getResults.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(getResults.join(" ") + "\n");
    }
    const remainingKeys = cache.getKeys();
    if (remainingKeys.length === 0) {
        process.stdout.write("EMPTY\n");
    }
    else {
        process.stdout.write(remainingKeys.join(" ") + "\n");
    }
}
solve();
