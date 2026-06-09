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
    }
    addToHead(node) {
        node.prev = null;
        node.next = this.head;
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
    }
    evict() {
        if (this.tail && this.tail !== this.head) {
            const node = this.tail;
            this.removeNode(node);
            this.map.delete(node.key);
        }
    }
    put(key, value) {
        const existingNode = this.map.get(key);
        if (existingNode) {
            existingNode.value = value;
            this.removeNode(existingNode);
            this.addToHead(existingNode);
        }
        else {
            const newNode = { key, value, prev: null, next: null };
            this.addToHead(newNode);
            this.map.set(key, newNode);
            if (this.map.size > this.capacity) {
                this.evict();
            }
        }
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this.removeNode(node);
        this.addToHead(node);
        return node.value;
    }
    delete(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
        }
    }
    getKeys() {
        const keys = [];
        let node = this.head;
        while (node) {
            keys.push(node.key);
            node = node.next;
        }
        return keys;
    }
}
const input = fs.readFileSync(0, 'utf8');
const lines = input.trim().split('\n');
const [C, N] = lines[0].split(' ').map(Number);
const cache = new LRUCache(C);
const getResults = [];
for (let i = 1; i <= N; i++) {
    const parts = lines[i].split(' ');
    const command = parts[0];
    const key = parts[1];
    switch (command) {
        case 'PUT':
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
            break;
        case 'GET':
            const result = cache.get(key);
            getResults.push(result);
            break;
        case 'DEL':
            cache.delete(key);
            break;
    }
}
const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
const keysOutput = cache.getKeys().length > 0 ? cache.getKeys().join(' ') : 'EMPTY';
console.log(getOutput);
console.log(keysOutput);
