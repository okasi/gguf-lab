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
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    if (lines.length === 0)
        return;
    const firstLine = lines[0].split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const line = lines[i];
        if (!line)
            continue;
        const parts = line.split(/\s+/);
        const op = parts[0];
        if (op === 'PUT') {
            const key = parts[1];
            const value = parseInt(parts[2], 10);
            cache.put(key, value);
        }
        else if (op === 'GET') {
            const key = parts[1];
            const val = cache.get(key);
            getResults.push(val.toString());
        }
        else if (op === 'DEL') {
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
        this.head = new Node('head', 0);
        this.tail = new Node('tail', 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    _addAfterHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    get(key) {
        const node = this.map.get(key);
        if (!node)
            return -1;
        this._remove(node);
        this._addAfterHead(node);
        return node.value;
    }
    put(key, value) {
        let node = this.map.get(key);
        if (node) {
            node.value = value;
            this._remove(node);
            this._addAfterHead(node);
        }
        else {
            node = new Node(key, value);
            this.map.set(key, node);
            this._addAfterHead(node);
            this.size++;
            if (this.size > this.capacity) {
                const lru = this.tail.prev;
                if (lru) {
                    this._remove(lru);
                    this.map.delete(lru.key);
                }
                this.size--;
            }
        }
    }
    del(key) {
        const node = this.map.get(key);
        if (node) {
            this._remove(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysInOrder() {
        const keys = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            keys.push(curr.key);
            curr = curr.next;
        }
        return keys;
    }
}
main();
