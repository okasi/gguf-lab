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
class ListNode {
    constructor(key, value, prev = null, next = null) {
        this.key = key;
        this.value = value;
        this.prev = prev;
        this.next = next;
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new ListNode("", 0);
        this.tail = new ListNode("", 0);
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
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lru = this.tail.prev;
                if (lru !== this.head) {
                    this.map.delete(lru.key);
                    this.removeNode(lru);
                }
            }
            const newNode = new ListNode(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    delete(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeysLRUOrder() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail && current !== null) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
    isEmpty() {
        return this.map.size === 0;
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
    const capacity = parseInt(firstLine[0]);
    const n = parseInt(firstLine[1]);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.trim().split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            cache.put(parts[1], parseInt(parts[2]));
        }
        else if (cmd === 'GET') {
            getResults.push(cache.get(parts[1]));
        }
        else if (cmd === 'DEL') {
            cache.delete(parts[1]);
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(' ') : "EMPTY";
    const keyOutput = !cache.isEmpty() ? cache.getKeysLRUOrder().join(' ') : "EMPTY";
    process.stdout.write(getOutput + "\n" + keyOutput + "\n");
}
solve();
