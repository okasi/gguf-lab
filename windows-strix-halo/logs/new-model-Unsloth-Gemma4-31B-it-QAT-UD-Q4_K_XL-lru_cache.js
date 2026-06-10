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
        this.remove(node);
        node.next = this.head;
        node.prev = null;
        if (this.head)
            this.head.prev = node;
        this.head = node;
        if (!this.tail)
            this.tail = node;
    }
    addToMRU(node) {
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
                    this.remove(lru);
                    this.map.delete(lru.key);
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToMRU(newNode);
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
            this.remove(node);
            this.map.delete(key);
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
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0)
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2)
        return;
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);
    const lru = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.trim().split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            lru.put(parts[1], parseInt(parts[2]));
        }
        else if (op === 'GET') {
            const val = lru.get(parts[1]);
            getResults.push(val === null ? "-1" : val.toString());
        }
        else if (op === 'DEL') {
            lru.del(parts[1]);
        }
    }
    process.stdout.write((getResults.length > 0 ? getResults.join(" ") : "EMPTY") + "\n");
    const finalKeys = lru.getKeys();
    process.stdout.write((finalKeys.length > 0 ? finalKeys.join(" ") : "EMPTY") + "\n");
}
solve();
