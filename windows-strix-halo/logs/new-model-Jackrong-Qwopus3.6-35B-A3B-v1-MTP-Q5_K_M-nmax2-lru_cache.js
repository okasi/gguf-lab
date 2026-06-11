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
class DoubleLinkedList {
    constructor() {
        this.head = { key: "", value: 0, prev: null, next: null };
        this.tail = { key: "", value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addAtHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        node.prev = null;
        node.next = null;
    }
    removeTail() {
        if (this.tail.prev && this.tail.prev !== this.head) {
            const node = this.tail.prev;
            this.removeNode(node);
            return node;
        }
        return null;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addAtHead(node);
    }
}
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.dll = new DoubleLinkedList();
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return -1;
        }
        this.dll.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        const existingNode = this.cache.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.dll.moveToHead(existingNode);
            return;
        }
        const newNode = { key, value, prev: null, next: null };
        this.dll.addAtHead(newNode);
        this.cache.set(key, newNode);
        if (this.cache.size > this.capacity) {
            const removedNode = this.dll.removeTail();
            if (removedNode) {
                this.cache.delete(removedNode.key);
            }
        }
    }
    delete(key) {
        const node = this.cache.get(key);
        if (node) {
            this.dll.removeNode(node);
            this.cache.delete(key);
        }
    }
    getKeysMostToLeast() {
        const keys = [];
        let current = this.dll.head.next;
        while (current && current !== this.dll.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
    isEmpty() {
        return this.cache.size === 0;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].trim().split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const operation = parts[0];
        const key = parts[1];
        if (operation === "PUT") {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (operation === "DEL") {
            cache.delete(key);
        }
    }
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    const keys = cache.getKeysMostToLeast();
    if (keys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(keys.join(" "));
    }
}
main();
