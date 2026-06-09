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
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev)
            prev.next = next;
        if (next)
            next.prev = prev;
    }
    addToFront(node) {
        const first = this.head.next;
        node.next = first;
        node.prev = this.head;
        this.head.next = node;
        first.prev = node;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        const existingNode = this.map.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.moveToFront(existingNode);
        }
        else {
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
            if (this.size > this.capacity) {
                const lruNode = this.tail.prev;
                if (lruNode) {
                    this.removeNode(lruNode);
                    this.map.delete(lruNode.key);
                    this.size--;
                }
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.head.next;
        while (current !== this.tail) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const firstLine = lines[0].trim();
    const [C, N] = firstLine.split(/\s+/).map(Number);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        const parts = line.split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (cmd === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    const keys = cache.getKeysInOrder();
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
main();
