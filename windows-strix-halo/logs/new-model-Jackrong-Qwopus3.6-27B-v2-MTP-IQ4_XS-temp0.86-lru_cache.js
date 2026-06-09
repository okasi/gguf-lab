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
        this.size = 0;
        this.map = new Map();
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    _remove(node) {
        const prev = node.prev;
        const next = node.next;
        prev.next = next;
        next.prev = prev;
    }
    _add(node) {
        const last = this.tail.prev;
        last.next = node;
        node.prev = last;
        node.next = this.tail;
        this.tail.prev = node;
    }
    _moveToTail(node) {
        this._remove(node);
        this._add(node);
    }
    get(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this._moveToTail(node);
            return node.value;
        }
        return -1;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this._moveToTail(node);
        }
        else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this._add(node);
            this.size++;
            if (this.size > this.capacity) {
                const lruNode = this.head.next;
                this._remove(lruNode);
                this.map.delete(lruNode.key);
                this.size--;
            }
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this._remove(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysFromMRUToLRU() {
        const keys = [];
        let curr = this.tail.prev;
        while (curr !== this.head) {
            keys.push(curr.key);
            curr = curr.prev;
        }
        return keys;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    const firstParts = lines[0].trim().split(/\s+/);
    const C = parseInt(firstParts[0], 10);
    const N = parseInt(firstParts[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const parts = lines[i].trim().split(/\s+/);
        const cmd = parts[0];
        if (cmd === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (cmd === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val);
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
    const remainingKeys = cache.getKeysFromMRUToLRU();
    if (remainingKeys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(remainingKeys.join(' '));
    }
}
main();
