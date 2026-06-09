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
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
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
        if (prev !== null && next !== null) {
            prev.next = next;
            next.prev = prev;
        }
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    removeLast() {
        const last = this.tail.prev;
        if (last !== null) {
            this.removeNode(last);
        }
        return last;
    }
    get(key) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.moveToFront(node);
            return node.value;
        }
        return -1;
    }
    put(key, value) {
        const existingNode = this.map.get(key);
        if (existingNode !== undefined) {
            existingNode.value = value;
            this.moveToFront(existingNode);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            if (this.map.size > this.capacity) {
                const lastNode = this.removeLast();
                if (lastNode !== null) {
                    this.map.delete(lastNode.key);
                }
            }
        }
    }
    delete(key) {
        const node = this.map.get(key);
        if (node !== undefined) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getOrderedKeys() {
        const keys = [];
        let current = this.head.next;
        while (current !== null && current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, "utf8").trim().split('\n');
const firstLine = input[0].split(' ');
const capacity = parseInt(firstLine[0], 10);
const n = parseInt(firstLine[1], 10);
const cache = new LRUCache(capacity);
const getResults = [];
for (let i = 1; i <= n; i++) {
    const line = input[i];
    const parts = line.split(' ');
    const operation = parts[0];
    const key = parts[1];
    if (operation === 'PUT') {
        const value = parseInt(parts[2], 10);
        cache.put(key, value);
    }
    else if (operation === 'GET') {
        const result = cache.get(key);
        getResults.push(result.toString());
    }
    else if (operation === 'DEL') {
        cache.delete(key);
    }
}
if (getResults.length === 0) {
    console.log("EMPTY");
}
else {
    console.log(getResults.join(' '));
}
const remainingKeys = cache.getOrderedKeys();
if (remainingKeys.length === 0) {
    console.log("EMPTY");
}
else {
    console.log(remainingKeys.join(' '));
}
