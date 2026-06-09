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
        this.head = null;
        this.tail = null;
        this.size = 0;
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
        node.prev = null;
        node.next = null;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    removeTail() {
        if (!this.tail) {
            return null;
        }
        const removedNode = this.tail;
        this.tail = this.tail.prev;
        if (this.tail) {
            this.tail.next = null;
        }
        else {
            this.head = null;
        }
        return removedNode;
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToHead(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const removedNode = this.removeTail();
                if (removedNode) {
                    this.map.delete(removedNode.key);
                    this.size--;
                }
            }
        }
    }
    delete(key) {
        if (!this.map.has(key)) {
            return;
        }
        const node = this.map.get(key);
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
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
const input = fs.readFileSync(0, "utf8").trim();
const lines = input.split("\n");
const firstLine = lines[0].split(" ");
const capacity = parseInt(firstLine[0], 10);
const numOperations = parseInt(firstLine[1], 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= numOperations; i++) {
    const parts = lines[i].split(" ");
    const operation = parts[0];
    if (operation === "GET") {
        const key = parts[1];
        const result = cache.get(key);
        getResults.push(result);
    }
    else if (operation === "PUT") {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (operation === "DEL") {
        const key = parts[1];
        cache.delete(key);
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
