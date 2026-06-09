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
        this.head = new Node('', 0); // dummy
        this.tail = new Node('', 0); // dummy
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    _addAfterHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }
    _moveToHead(node) {
        this._removeNode(node);
        this._addAfterHead(node);
    }
    _removeTail() {
        const node = this.tail.prev;
        this._removeNode(node);
        this.map.delete(node.key);
        this.size--;
    }
    get(key) {
        if (!this.map.has(key)) {
            return -1;
        }
        const node = this.map.get(key);
        this._moveToHead(node);
        return node.value;
    }
    put(key, value) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this._moveToHead(node);
        }
        else {
            const node = new Node(key, value);
            this.map.set(key, node);
            this._addAfterHead(node);
            this.size++;
            if (this.size > this.capacity) {
                this._removeTail();
            }
        }
    }
    del(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this._removeNode(node);
            this.map.delete(key);
            this.size--;
        }
    }
    getKeysOrder() {
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
    const firstLine = lines[0].trim().split(/\s+/);
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);
    const cache = new LRUCache(C);
    const getResults = [];
    for (let i = 1; i <= N; i++) {
        const line = lines[i].trim();
        if (!line)
            continue; // skip empty lines if any
        const parts = line.split(/\s+/);
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
    const firstOutput = getResults.length === 0 ? 'EMPTY' : getResults.join(' ');
    const keysOrder = cache.getKeysOrder();
    const secondOutput = keysOrder.length === 0 ? 'EMPTY' : keysOrder.join(' ');
    console.log(firstOutput);
    console.log(secondOutput);
}
main();
