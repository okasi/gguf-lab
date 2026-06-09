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
        this.head = null;
        this.tail = null;
        this.getResults = [];
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key).node;
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            if (this.map.size >= this.capacity) {
                this.evict();
            }
            this.addToHead(newNode);
            this.map.set(key, { value, node: newNode });
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            this.getResults.push(-1);
            return;
        }
        const node = this.map.get(key).node;
        this.moveToHead(node);
        this.getResults.push(node.value);
    }
    del(key) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key).node;
        this.removeNode(node);
        this.map.delete(key);
    }
    evict() {
        if (!this.tail)
            return;
        const keyToRemove = this.tail.key;
        this.removeNode(this.tail);
        this.map.delete(keyToRemove);
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
        if (this.head === node)
            return;
        this.removeNode(node);
        this.addToHead(node);
    }
    removeNode(node) {
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
    }
    getKeys() {
        const keys = [];
        let current = this.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}
function main() {
    const input = fs.readFileSync(0, "utf8").trim().split("\n");
    if (!input.length)
        return;
    const [capacityStr, operationsStr] = input[0].split(" ");
    const capacity = parseInt(capacityStr);
    const operationsCount = parseInt(operationsStr);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= operationsCount; i++) {
        const parts = input[i].split(" ");
        const op = parts[0];
        const key = parts[1];
        if (op === "PUT") {
            const value = parseInt(parts[2]);
            cache.put(key, value);
        }
        else if (op === "GET") {
            cache.get(key);
        }
        else if (op === "DEL") {
            cache.del(key);
        }
    }
    const getResults = cache.getResults;
    const remainingKeys = cache.getKeys();
    if (getResults.length) {
        console.log(getResults.join(" "));
    }
    else {
        console.log("EMPTY");
    }
    if (remainingKeys.length) {
        console.log(remainingKeys.join(" "));
    }
    else {
        console.log("EMPTY");
    }
}
main();
