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
        this.head = new Node('', -1);
        this.tail = new Node('', -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev && next) {
            prev.next = next;
            next.prev = prev;
        }
    }
    removeTail() {
        const lruNode = this.tail.prev;
        if (lruNode && lruNode !== this.head) {
            this.removeNode(lruNode);
            this.map.delete(lruNode.key);
        }
    }
    moveNodeToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this.moveNodeToHead(node);
        }
        else {
            if (this.map.size >= this.capacity) {
                this.removeTail();
            }
            const newNode = new Node(key, value);
            this.addToHead(newNode);
            this.map.set(key, newNode);
        }
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this.moveNodeToHead(node);
        return node.value;
    }
    delete(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeysInOrder() {
        const keys = [];
        let curr = this.head.next;
        while (curr && curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input)
        return;
    const lines = input.split('\n');
    const [C, N] = lines[0].split(' ').map(Number);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const parts = lines[i].split(' ');
        const operation = parts[0];
        const key = parts[1];
        const value = parts[2];
        switch (operation) {
            case 'PUT':
                cache.put(key, parseInt(value));
                break;
            case 'GET':
                getResults.push(cache.get(key));
                break;
            case 'DEL':
                cache.delete(key);
                break;
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const remainingKeys = cache.getKeysInOrder();
    const keysOutput = remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY';
    console.log(getOutput);
    console.log(keysOutput);
}
solve();
