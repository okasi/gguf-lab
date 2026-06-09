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
        this.size = 0;
        // Dummy nodes for easier list operations
        this.head = new Node('', 0);
        this.tail = new Node('', 0);
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
    moveToHead(node) {
        this.removeNode(node);
        this.addToFront(node);
    }
    removeTail() {
        const last = this.tail.prev;
        if (last && last !== this.head) {
            this.removeNode(last);
            return last;
        }
        return null;
    }
    put(key, value) {
        const existing = this.map.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
        }
        else {
            if (this.size >= this.capacity) {
                const tailNode = this.removeTail();
                if (tailNode) {
                    this.map.delete(tailNode.key);
                    this.size--;
                }
            }
            const newNode = new Node(key, value);
            this.map.set(key, newNode);
            this.addToFront(newNode);
            this.size++;
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
        if (node) {
            this.removeNode(node);
            this.map.delete(key);
            this.size--;
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
    if (!input)
        return;
    const lines = input.split('\n');
    const [capacityStr, nStr] = lines[0].split(' ');
    const capacity = parseInt(capacityStr, 10);
    const n = parseInt(nStr, 10);
    const cache = new LRUCache(capacity);
    const getResult = [];
    for (let i = 1; i <= n; i++) {
        const parts = lines[i].split(' ');
        const operation = parts[0];
        const key = parts[1];
        switch (operation) {
            case 'PUT':
                const value = parseInt(parts[2], 10);
                cache.put(key, value);
                break;
            case 'GET':
                getResult.push(cache.get(key));
                break;
            case 'DEL':
                cache.del(key);
                break;
        }
    }
    if (getResult.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResult.join(' '));
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
