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
        node.next = null;
        node.prev = null;
    }
    setMostRecent(node) {
        if (!this.head) {
            this.head = this.tail = node;
        }
        else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
            if (!this.tail)
                this.tail = node;
        }
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.remove(node);
            this.setMostRecent(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                if (this.tail) {
                    this.map.delete(this.tail.key);
                    this.remove(this.tail);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.setMostRecent(newNode);
        }
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.remove(node);
        this.setMostRecent(node);
        return node.value;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.remove(node);
            this.map.delete(key);
        }
    }
    getKeys() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
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
    const results = [];
    for (let i = 0; i < N; i++) {
        const op = input[ptr++];
        if (op === 'PUT') {
            const key = input[ptr++];
            const val = parseInt(input[ptr++]);
            cache.put(key, val);
        }
        else if (op === 'GET') {
            const key = input[ptr++];
            results.push(cache.get(key));
        }
        else if (op === 'DEL') {
            const key = input[ptr++];
            cache.del(key);
        }
    }
    process.stdout.write((results.length > 0 ? results.join(' ') : 'EMPTY') + '\n');
    const keys = cache.getKeys();
    process.stdout.write((keys.length > 0 ? keys.join(' ') : 'EMPTY') + '\n');
}
solve();
