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
        this.keyNodeMap = new Map();
        this.head = new DoublyListNode(null, null);
        this.tail = new DoublyListNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    removeFromNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    addToHead(node) {
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
        node.prev = this.head;
    }
    removeTail() {
        const node = this.tail.prev;
        if (node === this.head) {
            return null;
        }
        this.removeFromNode(node);
        return node;
    }
    get(key) {
        const node = this.keyNodeMap.get(key);
        if (!node) {
            return -1;
        }
        this.removeFromNode(node);
        this.addToHead(node);
        return node.value;
    }
    put(key, value) {
        const existingNode = this.keyNodeMap.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.removeFromNode(existingNode);
            this.addToHead(existingNode);
        }
        else {
            if (this.keyNodeMap.size >= this.capacity) {
                const evictedNode = this.removeTail();
                if (evictedNode) {
                    this.keyNodeMap.delete(evictedNode.key);
                }
            }
            const newNode = new DoublyListNode(key, value);
            this.addToHead(newNode);
            this.keyNodeMap.set(key, newNode);
        }
    }
    delete(key) {
        const node = this.keyNodeMap.get(key);
        if (node) {
            this.removeFromNode(node);
            this.keyNodeMap.delete(key);
        }
    }
    getLRUOrder() {
        const result = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
class DoublyListNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim();
    const lines = input.split("\n");
    const firstLine = lines[0].split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(/\s+/);
        const operation = parts[0];
        const key = parts[1];
        if (operation === "GET") {
            const result = cache.get(key);
            getResults.push(String(result));
        }
        else if (operation === "PUT") {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (operation === "DEL") {
            cache.delete(key);
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(" ") : "EMPTY";
    const keysOrder = cache.getLRUOrder();
    const keysOutput = keysOrder.length > 0 ? keysOrder.join(" ") : "EMPTY";
    console.log(getOutput);
    console.log(keysOutput);
}
main();
