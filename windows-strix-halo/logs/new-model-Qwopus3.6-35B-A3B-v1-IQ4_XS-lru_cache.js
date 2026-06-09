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
    addToFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    removeTail() {
        const node = this.tail.prev;
        if (node) {
            this.removeNode(node);
            return node;
        }
        return null;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }
        const node = new Node(key, value);
        this.addToFront(node);
        this.map.set(key, node);
        if (this.map.size > this.capacity) {
            const removed = this.removeTail();
            if (removed) {
                this.map.delete(removed.key);
            }
        }
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToFront(node);
        return node.value;
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
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const [capacityStr, nStr] = lines[0].split(" ");
    const capacity = parseInt(capacityStr);
    const n = parseInt(nStr);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(" ");
        const operation = parts[0];
        const key = parts[1];
        const value = parts[2];
        if (operation === "PUT") {
            cache.put(key, parseInt(value));
        }
        else if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(result.toString());
        }
        else if (operation === "DEL") {
            cache.del(key);
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
