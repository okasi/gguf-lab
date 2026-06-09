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
        this.cache = new Map();
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
        const node = this.tail.prev;
        if (node && node !== this.head) {
            this.removeNode(node);
            return node;
        }
        return null;
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.cache.get(key);
        if (node) {
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.cache.set(key, newNode);
            this.addToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const tail = this.removeTail();
                if (tail) {
                    this.cache.delete(tail.key);
                    this.size--;
                }
            }
        }
    }
    delete(key) {
        const node = this.cache.get(key);
        if (node) {
            this.removeNode(node);
            this.cache.delete(key);
            this.size--;
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
const input = fs.readFileSync(0, "utf8");
const lines = input.trim().split("\n");
const firstLine = lines[0].split(" ");
const capacity = parseInt(firstLine[0]);
const n = parseInt(firstLine[1]);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= n; i++) {
    const line = lines[i].trim();
    const parts = line.split(" ");
    const op = parts[0];
    const key = parts[1];
    if (op === "PUT") {
        const value = parseInt(parts[2]);
        cache.put(key, value);
    }
    else if (op === "GET") {
        const result = cache.get(key);
        getResults.push(result.toString());
    }
    else if (op === "DEL") {
        cache.delete(key);
    }
}
if (getResults.length > 0) {
    console.log(getResults.join(" "));
}
else {
    console.log("EMPTY");
}
const remainingKeys = cache.getKeys();
if (remainingKeys.length > 0) {
    console.log(remainingKeys.join(" "));
}
else {
    console.log("EMPTY");
}
