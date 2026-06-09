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
        this.capacity = Math.max(1, capacity);
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    remove(node) {
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
        if (node === undefined)
            return -1;
        this.remove(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.remove(node);
            this.addToHead(node);
        }
        else {
            if (this.size >= this.capacity) {
                const lru = this.tail.prev;
                if (lru !== this.head) {
                    this.remove(lru);
                    this.map.delete(lru.key);
                    this.size--;
                }
            }
            if (this.size < this.capacity) {
                const newNode = new Node(key, value);
                this.addToHead(newNode);
                this.map.set(key, newNode);
                this.size++;
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.remove(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getRemainingKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== undefined && curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function solve() {
    const input = fs.readFileSync(0, "utf8");
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2)
        return;
    let idx = 0;
    const C = parseInt(tokens[idx++], 10);
    const N = parseInt(tokens[idx++], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        if (idx >= tokens.length)
            break;
        const op = tokens[idx++];
        if (op === "PUT") {
            const key = tokens[idx++];
            const value = parseInt(tokens[idx++], 10);
            cache.put(key, value);
        }
        else if (op === "GET") {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        }
        else if (op === "DEL") {
            const key = tokens[idx++];
            cache.del(key);
        }
    }
    process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
    const keys = cache.getRemainingKeys();
    process.stdout.write(keys.length > 0 ? keys.join(" ") + "\n" : "EMPTY\n");
}
solve();
