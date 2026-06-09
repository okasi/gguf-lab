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
    addToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    addToTail(node) {
        node.prev = this.tail.prev;
        node.next = this.tail;
        this.tail.prev.next = node;
        this.tail.prev = node;
    }
    removeTail() {
        const node = this.tail.prev;
        if (node) {
            node.prev.next = this.tail;
            this.tail.prev = node.prev;
        }
        return node;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            node.value = value;
            this.addToHead(node);
        }
        else {
            if (this.size === this.capacity) {
                const tailNode = this.removeTail();
                this.map.delete(tailNode.key);
                this.size--;
            }
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
            this.size++;
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }
    remove(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
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
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [cStr, nStr] = lines[0].split(' ');
    const C = parseInt(cStr, 10);
    const N = parseInt(nStr, 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const parts = lines[i].split(' ');
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
            cache.remove(key);
        }
    }
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    const keysInOrder = cache.getKeysInOrder();
    if (keysInOrder.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keysInOrder.join(' '));
    }
}
main();
