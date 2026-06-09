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
const raw = fs.readFileSync(0, "utf8").trim();
if (!raw)
    process.exit(0);
const data = raw.split(/\s+/);
const C = Number(data[0]);
const N = Number(data[1]);
let idx = 2;
class Node {
    constructor(key, val) {
        this.key = key;
        this.val = val;
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
        this.size = 0;
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
    popTail() {
        if (this.tail.prev === this.head)
            return null;
        const node = this.tail.prev;
        this.removeNode(node);
        return node;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.val = value;
            this.moveToHead(node);
        }
        else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this.addToHead(node);
            this.size++;
            if (this.size > this.capacity) {
                const tail = this.popTail();
                this.map.delete(tail.key);
                this.size--;
            }
        }
    }
    get(key) {
        if (!this.map.has(key))
            return -1;
        const node = this.map.get(key);
        this.moveToHead(node);
        return node.val;
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getOrderedKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr && curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
const cache = new LRUCache(C);
const getResults = [];
for (let i = 0; i < N; i++) {
    const op = data[idx++];
    if (op === "PUT") {
        const key = data[idx++];
        const val = Number(data[idx++]);
        cache.put(key, val);
    }
    else if (op === "GET") {
        const key = data[idx++];
        getResults.push(cache.get(key));
    }
    else if (op === "DEL") {
        const key = data[idx++];
        cache.del(key);
    }
}
const output = [];
output.push(getResults.length > 0 ? getResults.join(" ") : "EMPTY");
output.push(cache.getOrderedKeys().length > 0 ? cache.getOrderedKeys().join(" ") : "EMPTY");
console.log(output.join("\n"));
