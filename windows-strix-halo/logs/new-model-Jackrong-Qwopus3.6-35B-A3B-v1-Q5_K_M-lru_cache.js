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
class DoublyLinkedListNode {
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
        this.count = 0;
        this.map = new Map();
        // Create sentinel nodes
        this.head = new DoublyLinkedListNode('', 0);
        this.tail = new DoublyLinkedListNode('', 0);
        // Link sentinel nodes
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    moveToFront(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    evictTail() {
        const node = this.tail.prev;
        if (node && node !== this.tail) {
            this.removeNode(node);
            this.map.delete(node.key);
            this.count--;
        }
    }
    put(key, value) {
        const existingNode = this.map.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.moveToFront(existingNode);
            return;
        }
        const newNode = new DoublyLinkedListNode(key, value);
        this.map.set(key, newNode);
        this.addToFront(newNode);
        this.count++;
        if (this.count > this.capacity) {
            this.evictTail();
        }
    }
    get(key) {
        const existingNode = this.map.get(key);
        if (!existingNode) {
            return -1;
        }
        this.moveToFront(existingNode);
        return existingNode.value;
    }
    del(key) {
        const existingNode = this.map.get(key);
        if (existingNode) {
            this.removeNode(existingNode);
            this.map.delete(key);
            this.count--;
        }
    }
    getKeysInOrder() {
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
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length === 0) {
        return;
    }
    const [C_str, N_str] = lines[0].split(' ');
    const C = parseInt(C_str, 10);
    const N = parseInt(N_str, 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N && i < lines.length; i++) {
        const parts = lines[i].trim().split(' ');
        const operation = parts[0];
        const key = parts[1];
        if (operation === 'PUT') {
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (operation === 'GET') {
            const result = cache.get(key);
            getResults.push(result);
        }
        else if (operation === 'DEL') {
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
