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
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    addToFront(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        const node = this.cache.get(key);
        this.removeNode(node);
        this.addToFront(node);
        return node.value;
    }
    put(key, value) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            node.value = value;
            this.removeNode(node);
            this.addToFront(node);
        }
        else {
            if (this.cache.size === this.capacity) {
                const tailPrev = this.tail.prev;
                this.removeNode(tailPrev);
                this.cache.delete(tailPrev.key);
            }
            const node = new Node(key, value);
            this.cache.set(key, node);
            this.addToFront(node);
        }
    }
    del(key) {
        if (this.cache.has(key)) {
            const node = this.cache.get(key);
            this.removeNode(node);
            this.cache.delete(key);
        }
    }
    getKeysMRUtoLRU() {
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
    const tokens = input.split(/\s+/);
    let idx = 0;
    const C = parseInt(tokens[idx++], 10);
    const N = parseInt(tokens[idx++], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 0; i < N; i++) {
        const op = tokens[idx++];
        if (op === 'PUT') {
            const key = tokens[idx++];
            const value = parseInt(tokens[idx++], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = tokens[idx++];
            getResults.push(cache.get(key));
        }
        else if (op === 'DEL') {
            const key = tokens[idx++];
            cache.del(key);
        }
    }
    if (getResults.length > 0) {
        console.log(getResults.join(' '));
    }
    else {
        console.log('EMPTY');
    }
    const keys = cache.getKeysMRUtoLRU();
    if (keys.length > 0) {
        console.log(keys.join(' '));
    }
    else {
        console.log('EMPTY');
    }
}
main();
