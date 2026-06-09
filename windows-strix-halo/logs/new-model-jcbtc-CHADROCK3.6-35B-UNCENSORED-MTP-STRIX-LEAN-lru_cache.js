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
        // Dummy head and tail
        this.head = { key: '', value: 0, prev: null, next: null };
        this.tail = { key: '', value: 0, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
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
        node.prev = null;
        node.next = null;
    }
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    popTail() {
        const res = this.tail.prev;
        if (res) {
            this.removeNode(res);
        }
        return res;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
            return;
        }
        const newNode = {
            key,
            value,
            prev: null,
            next: null
        };
        this.addToHead(newNode);
        this.map.set(key, newNode);
        this.size++;
        if (this.size > this.capacity) {
            const tail = this.popTail();
            this.map.delete(tail.key);
            this.size--;
        }
    }
    get(key) {
        const node = this.map.get(key);
        if (!node) {
            return -1;
        }
        this.moveToHead(node);
        return node.value;
    }
    del(key) {
        const node = this.map.get(key);
        if (!node) {
            return false;
        }
        this.removeNode(node);
        this.map.delete(key);
        this.size--;
        return true;
    }
    getKeysInOrder() {
        const result = [];
        let current = this.head.next;
        while (current && current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
function main() {
    const input = fs.readFileSync(0, 'utf8');
    const lines = input.trim().split('\n');
    if (lines.length === 0)
        return;
    const firstLine = lines[0].trim().split(/\s+/);
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);
    const cache = new LRUCache(capacity);
    const getResults = [];
    for (let i = 1; i <= n; i++) {
        const line = lines[i].trim().split(/\s+/);
        if (line.length === 0)
            continue;
        const operation = line[0];
        switch (operation) {
            case 'PUT':
                const putKey = line[1];
                const putValue = parseInt(line[2], 10);
                cache.put(putKey, putValue);
                break;
            case 'GET':
                const getKey = line[1];
                const getResult = cache.get(getKey);
                getResults.push(getResult.toString());
                break;
            case 'DEL':
                const delKey = line[1];
                cache.del(delKey);
                break;
        }
    }
    const getOutput = getResults.length > 0 ? getResults.join(' ') : 'EMPTY';
    const remainingKeys = cache.getKeysInOrder();
    const keysOutput = remainingKeys.length > 0 ? remainingKeys.join(' ') : 'EMPTY';
    console.log(getOutput);
    console.log(keysOutput);
}
main();
