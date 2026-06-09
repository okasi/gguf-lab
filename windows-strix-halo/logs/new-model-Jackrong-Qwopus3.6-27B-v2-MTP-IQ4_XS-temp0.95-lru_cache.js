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
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }
}
class DoublyLinkedList {
    constructor() {
        this.size = 0;
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next?.prev = node;
        this.head.next = node;
        this.size++;
    }
    remove(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev)
            prev.next = next;
        if (next)
            next.prev = prev;
        this.size--;
    }
    moveToFront(node) {
        this.remove(node);
        this.addFront(node);
    }
    removeLRU() {
        if (this.size === 0)
            return null;
        // node before tail
        const node = this.tail.prev;
        if (node === this.head)
            return null; // should not happen if size>0
        this.remove(node);
        return node;
    }
    // optional: get all keys in order from front to back
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
class LRUCache {
    constructor(capacity) {
        this.map = new Map();
        this.capacity = capacity;
        this.list = new DoublyLinkedList();
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.list.moveToFront(node);
        return node.value;
    }
    put(key, value) {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this.list.moveToFront(node);
        }
        else {
            node = new Node(key, value);
            this.map.set(key, node);
            this.list.addFront(node);
            if (this.list.size > this.capacity) {
                // evict LRU
                const lruNode = this.list.removeLRU();
                if (lruNode) {
                    this.map.delete(lruNode.key);
                }
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this.list.remove(node);
            this.map.delete(key);
        }
    }
    getKeysMRUtoLRU() {
        return this.list.getAllKeys();
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split(/\r?\n/);
    if (lines.length === 0)
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N && i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue; // skip empty lines
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = parts[1];
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (op === 'DEL') {
            const key = parts[1];
            cache.del(key);
        }
    }
    // Output first line
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    // Output second line
    const remainingKeys = cache.getKeysMRUtoLRU();
    if (remainingKeys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
main();
