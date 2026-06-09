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
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    addFront(node) {
        const next = this.head.next;
        node.next = next;
        node.prev = this.head;
        this.head.next = node;
        next.prev = node;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addFront(node);
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addFront(node);
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
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysMRUtoLRU() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split(/\r?\n/);
const [C, N] = lines[0].split(/\s+/).map(Number);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line)
        continue;
    const parts = line.split(/\s+/);
    const op = parts[0];
    const key = parts[1];
    if (op === 'PUT') {
        cache.put(key, Number(parts[2]));
    }
    else if (op === 'GET') {
        getResults.push(cache.get(key));
    }
    else if (op === 'DEL') {
        cache.del(key);
    }
}
console.log(getResults.length > 0 ? getResults.join(' ') : 'EMPTY');
const remainingKeys = cache.getKeysMRUtoLRU();
console.log(remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY');
