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
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new DLLNode("", -1);
        this.tail = new DLLNode("", -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    // Remove a node from the doubly linked list
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    // Move a node to the front (most recently used)
    moveToFront(node) {
        this.removeNode(node);
        this.addAtFront(node);
    }
    // Add a node to the front (most recently used)
    addAtFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    // Remove the last node (least recently used)
    removeLast() {
        if (this.tail.prev === this.head) {
            return null;
        }
        const last = this.tail.prev;
        this.removeNode(last);
        return last;
    }
    get(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.moveToFront(node);
            return node.value;
        }
        return -1;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                const lru = this.removeLast();
                if (lru) {
                    this.map.delete(lru.key);
                }
            }
            const newNode = new DLLNode(key, value);
            this.addAtFront(newNode);
            this.map.set(key, newNode);
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeysInOrder() {
        const result = [];
        let current = this.head.next;
        while (current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
class DLLNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = this;
        this.next = this;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(" ");
    const capacity = parseInt(firstLine[0], 10);
    const numOperations = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= numOperations; i++) {
        const line = lines[i].trim();
        const parts = line.split(" ");
        const operation = parts[0];
        const key = parts[1];
        if (operation === "PUT") {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(result.toString());
        }
        else if (operation === "DEL") {
            cache.del(key);
        }
    }
    // Output first line: GET results
    if (getResults.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(getResults.join(" "));
    }
    // Output second line: remaining keys
    const remainingKeys = cache.getKeysInOrder();
    if (remainingKeys.length === 0) {
        console.log("EMPTY");
    }
    else {
        console.log(remainingKeys.join(" "));
    }
}
main();
