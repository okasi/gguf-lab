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
        this.cache = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    moveToFront(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        const nextNode = this.head.next;
        node.next = nextNode;
        node.prev = this.head;
        this.head.next = node;
        nextNode.prev = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    addFront(node) {
        const nextNode = this.head.next;
        node.next = nextNode;
        node.prev = this.head;
        this.head.next = node;
        nextNode.prev = node;
    }
    removeLast() {
        if (this.size === 0)
            return null;
        const node = this.tail.prev;
        this.removeNode(node);
        this.size--;
        return node;
    }
    get(key) {
        if (!this.cache.has(key))
            return -1;
        const node = this.cache.get(key);
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.value = value;
            this.moveToFront(node);
        }
        else {
            const node = new Node(key, value);
            this.cache.set(key, node);
            this.addFront(node);
            this.size++;
            if (this.size > this.capacity) {
                const removed = this.removeLast();
                if (removed) {
                    this.cache.delete(removed.key);
                }
            }
        }
    }
    del(key) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            this.removeNode(node);
            this.cache.delete(key);
            this.size--;
        }
    }
    getAllKeys() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input)
        return;
    const lines = input.split(/\r?\n/);
    const firstLineParts = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLineParts[0], 10);
    const N = parseInt(firstLineParts[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        const key = parts[1];
        if (cmd === 'GET') {
            const val = cache.get(key);
            getResults.push(val);
        }
        else if (cmd === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'DEL') {
            cache.del(key);
        }
    }
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    const keys = cache.getAllKeys();
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
main();
