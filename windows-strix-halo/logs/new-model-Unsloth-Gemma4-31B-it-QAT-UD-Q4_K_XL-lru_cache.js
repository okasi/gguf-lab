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
        this.head = null;
        this.tail = null;
        this.capacity = capacity;
        this.map = new Map();
    }
    remove(node) {
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
    }
    setMRU(node) {
        if (this.head === node)
            return;
        this.remove(node);
        node.next = this.head;
        node.prev = null;
        if (this.head)
            this.head.prev = node;
        this.head = node;
        if (!this.tail)
            this.tail = node;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.setMRU(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail;
                if (lru) {
                    this.map.delete(lru.key);
                    this.remove(lru);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.setMRU(newNode);
        }
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return null;
        this.setMRU(node);
        return node.value;
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.map.delete(key);
            this.remove(node);
        }
    }
    getKeys() {
        const keys = [];
        let curr = this.head;
        while (curr) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8").split(/\s+/);
    let ptr = 0;
    if (ptr >= input.length)
        return;
    const C = parseInt(input[ptr++]);
    const N = parseInt(input[ptr++]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const op = input[ptr++];
        if (op === 'PUT') {
            const key = input[ptr++];
            const value = parseInt(input[ptr++]);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = input[ptr++];
            const val = cache.get(key);
            getResults.push(val === null ? -1 : val);
        }
        else if (op === 'DEL') {
            const key = input[ptr++];
            cache.del(key);
        }
    }
    process.stdout.write((getResults.length > 0 ? getResults.join(' ') : 'EMPTY') + '\n');
    const finalKeys = cache.getKeys();
    process.stdout.write((finalKeys.length > 0 ? finalKeys.join(' ') : 'EMPTY') + '\n');
}
solve();
