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
        // Dummy nodes for easier manipulation
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    removeTail() {
        const toRemove = this.tail.prev;
        if (toRemove) {
            this.removeNode(toRemove);
            this.map.delete(toRemove.key);
            this.size--;
        }
    }
    put(key, value) {
        if (this.map.has(key)) {
            const existing = this.map.get(key);
            if (existing) {
                existing.value = value;
                this.moveToHead(existing);
            }
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                this.removeTail();
            }
        }
    }
    get(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            if (node) {
                this.moveToHead(node);
                return node.value;
            }
        }
        return -1;
    }
    delete(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            if (node) {
                this.removeNode(node);
                this.map.delete(key);
                this.size--;
            }
        }
    }
    getKeys() {
        const keys = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [C, N] = lines[0].split(" ").map(Number);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (line.startsWith("PUT")) {
            const parts = line.split(" ");
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (line.startsWith("GET")) {
            const parts = line.split(" ");
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (line.startsWith("DEL")) {
            const parts = line.split(" ");
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
    const keys = cache.getKeys();
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(" "));
    }
}
main();
