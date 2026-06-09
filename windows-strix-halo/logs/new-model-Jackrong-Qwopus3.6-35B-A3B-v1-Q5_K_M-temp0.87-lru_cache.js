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
        this.head = { key: '', value: 0, prev: null, next: null };
        this.tail = { key: '', value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    removeNode(node) {
        const { prev, next } = node;
        if (prev)
            prev.next = next;
        if (next)
            next.prev = prev;
    }
    addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        if (this.head.next)
            this.head.next.prev = node;
        this.head.next = node;
    }
    moveToFront(node) {
        if (node === this.head.next)
            return;
        this.removeNode(node);
        this.addToFront(node);
    }
    removeLast() {
        const last = this.tail.prev;
        if (last && last !== this.head) {
            this.removeNode(last);
            this.size--;
            return last;
        }
        return null;
    }
    get(key) {
        const node = this.map.get(key);
        if (node) {
            this.moveToFront(node);
            return node.value;
        }
        return -1;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToFront(existing);
            return;
        }
        if (this.size >= this.capacity) {
            const evicted = this.removeLast();
            if (evicted) {
                this.map.delete(evicted.key);
            }
        }
        const newNode = { key, value, prev: null, next: null };
        this.addToFront(newNode);
        this.map.set(key, newNode);
        this.size++;
    }
    delete(key) {
        const node = this.map.get(key);
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
            return true;
        }
        return false;
    }
    getKeys() {
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
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length < 1)
        return;
    const [capacityStr, numOpsStr] = lines[0].split(' ');
    const capacity = parseInt(capacityStr, 10);
    const numOps = parseInt(numOpsStr, 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= numOps; i++) {
        const parts = lines[i].split(' ');
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
            cache.delete(key);
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const keys = cache.getKeys();
    const keysOutput = keys.length > 0 ? keys.join(' ') : 'EMPTY';
    console.log(getOutput);
    console.log(keysOutput);
}
main();
