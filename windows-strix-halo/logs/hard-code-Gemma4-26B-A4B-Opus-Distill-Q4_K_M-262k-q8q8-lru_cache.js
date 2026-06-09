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
class LRUCache {
    constructor(capacity) {
        this.size = 0;
        this.head = null;
        this.tail = null;
        this.capacity = capacity;
        this.cache = new Map();
    }
    removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        else
            this.head = node.next;
        if (node.next)
            node.next.prev = node.prev;
        else
            this.tail = node.prev;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    addToHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head)
            this.head.prev = node;
        this.head = node;
        if (!this.tail)
            this.tail = node;
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node)
            return -1;
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const existing = this.cache.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
            return;
        }
        if (this.size === this.capacity) {
            if (this.tail) {
                this.cache.delete(this.tail.key);
                this.removeNode(this.tail);
                this.size--;
            }
        }
        const newNode = { key, value, prev: null, next: this.head };
        if (this.head)
            this.head.prev = newNode;
        this.head = newNode;
        if (!this.tail)
            this.tail = newNode;
        this.cache.set(key, newNode);
        this.size++;
    }
    delete(key) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
            this.size--;
        }
    }
    getOrderedKeys() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0 || lines[0].trim() === "")
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0]);
    const N = parseInt(firstLine[1]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        if (!lines[i])
            continue;
        const parts = lines[i].trim().split(/\s+/);
        const op = parts[0];
        if (op === "PUT") {
            const key = parts[1];
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (op === "GET") {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (op === "DEL") {
            const key = parts[1];
            cache.delete(key);
        }
    }
    process.stdout.write((getResults.length > 0 ? getResults.join(" ") : "EMPTY") + "\n");
    const remainingKeys = cache.getOrderedKeys();
    process.stdout.write((remainingKeys.length > 0 ? remainingKeys.join(" ") : "EMPTY") + "\n");
}
solve();
