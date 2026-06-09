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
        this.size = 0;
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
    moveToHead(node) {
        this.removeNode(node);
        this.addToFront(node);
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
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.moveToHead(node);
            return node.value;
        }
        return -1;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveToHead(node);
        }
        else {
            if (this.size >= this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
            const newNode = new Node(key, value);
            this.addToFront(newNode);
            this.map.set(key, newNode);
            this.size++;
        }
    }
    delete(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
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
function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    if (input.length === 0)
        return;
    const firstLine = input[0].split(' ');
    const capacity = parseInt(firstLine[0], 10);
    const numOps = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= numOps; i++) {
        const parts = input[i].split(' ');
        const op = parts[0];
        const key = parts[1];
        if (op === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (op === 'DEL') {
            cache.delete(key);
        }
    }
    const getOutput = getResults.length > 0
        ? getResults.join(' ')
        : 'EMPTY';
    const keys = cache.getKeys();
    const keysOutput = keys.length > 0
        ? keys.join(' ')
        : 'EMPTY';
    console.log(getOutput);
    console.log(keysOutput);
}
main();
