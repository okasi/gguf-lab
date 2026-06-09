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
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
        node.prev = null;
        node.next = null;
    }
    addToHead(node) {
        node.next = this.head;
        node.prev = null;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    moveToHead(node) {
        if (node === this.head)
            return;
        this.remove(node);
        this.addToHead(node);
    }
    get(key) {
        const node = this.map.get(key);
        if (node === undefined)
            return -1;
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node !== undefined) {
            node.value = value;
            this.moveToHead(node);
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
            this.addToHead(newNode);
            this.map.set(key, newNode);
        }
    }
    delete(key) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.remove(node);
            this.map.delete(key);
        }
    }
    getRemainingKeys() {
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
    let input = "";
    try {
        input = fs.readFileSync(0, "utf8");
    }
    catch (e) {
        return;
    }
    if (!input)
        return;
    const tokens = input.trim().split(/\s+/);
    if (tokens.length < 2)
        return;
    let idx = 0;
    const C = parseInt(tokens[idx++]);
    const N = parseInt(tokens[idx++]);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        if (idx >= tokens.length)
            break;
        const op = tokens[idx++];
        if (op === "PUT") {
            const key = tokens[idx++];
            const value = parseInt(tokens[idx++]);
            cache.put(key, value);
        }
        else if (op === "GET") {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        }
        else if (op === "DEL") {
            const key = tokens[idx++];
            cache.delete(key);
        }
    }
    process.stdout.write(getResults.length > 0 ? getResults.join(" ") + "\n" : "EMPTY\n");
    const remaining = cache.getRemainingKeys();
    process.stdout.write(remaining.length > 0 ? remaining.join(" ") + "\n" : "EMPTY\n");
}
solve();
