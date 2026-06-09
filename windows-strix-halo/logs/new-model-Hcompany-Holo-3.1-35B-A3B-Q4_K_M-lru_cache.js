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
        this.map = new Map();
        this.head = new Node("", 0);
        this.tail = new Node("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeTail() {
        const node = this.tail.prev;
        if (node) {
            this.removeNode(node);
        }
        return node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const node = this.map.get(key);
        if (node) {
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            if (this.map.size > this.capacity) {
                const tail = this.removeTail();
                if (tail) {
                    this.map.delete(tail.key);
                }
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
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
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const [C, N] = lines[0].split(" ").map(Number);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(" ");
    const operation = parts[0];
    const key = parts[1];
    if (operation === "GET") {
        const value = cache.get(key);
        getResults.push(value);
    }
    else if (operation === "PUT") {
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (operation === "DEL") {
        cache.del(key);
    }
}
const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
const keys = cache.getKeys();
const keysOutput = keys.length > 0 ? keys.join(" ") : "EMPTY";
console.log(getOutput);
console.log(keysOutput);
