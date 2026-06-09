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
        this.count = 0;
        this.cache = new Map();
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    removeTail() {
        if (this.tail.prev === this.head)
            return null;
        const node = this.tail.prev;
        this.removeNode(node);
        return node;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            if (this.count === this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.cache.delete(tailNode.key);
                    this.count--;
                }
            }
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.cache.set(key, newNode);
            this.count++;
        }
    }
    get(key) {
        if (!this.cache.has(key))
            return -1;
        const node = this.cache.get(key);
        this.moveToHead(node);
        return node.value;
    }
    del(key) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            this.removeNode(node);
            this.cache.delete(key);
            this.count--;
        }
    }
    getKeys() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    if (!input)
        return;
    const lines = input.split("\n");
    const [c, n] = lines[0].split(/\s+/).map(Number);
    const lru = new LRUCache(c);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        const key = parts[1];
        if (op === "PUT") {
            const value = parseInt(parts[2], 10);
            lru.put(key, value);
        }
        else if (op === "GET") {
            const result = lru.get(key);
            getResults.push(result);
        }
        else if (op === "DEL") {
            lru.del(key);
        }
    }
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    const keys = lru.getKeys();
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(" "));
    }
}
main();
