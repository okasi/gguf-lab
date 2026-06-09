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
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    get size() {
        return this.size;
    }
    removeNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (prev) {
            prev.next = next;
        }
        else {
            this.head = next;
        }
        if (next) {
            next.prev = prev;
        }
        else {
            this.tail = prev;
        }
        this.size--;
    }
    moveToHead(node) {
        if (node.prev) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        else {
            // Node is already head
        }
        if (this.head === node) {
            return;
        }
        if (this.tail === node) {
            this.tail = node.prev;
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.removeNode(node);
            this.head = node.next;
            this.tail = node.prev;
            this.size++;
            return;
        }
        // Insert at head
        node.prev = this.head;
        this.head?.next = node;
        this.head = node;
        node.next = this.head?.next;
        this.head?.next?.prev = node;
        if (this.tail === node) {
            this.tail = node;
        }
        this.size++;
    }
    removeTail() {
        const tail = this.tail;
        if (!tail) {
            return null;
        }
        this.removeNode(tail);
        this.tail = tail.prev;
        return tail;
    }
    append(node) {
        if (!this.tail) {
            this.head = node;
            this.tail = node;
            this.size++;
            return;
        }
        node.prev = this.tail;
        this.tail.next = node;
        node.next = null;
        this.tail = node;
        this.size++;
    }
}
class LRUCache {
    constructor(capacity) {
        this.cache = new Map();
        this.list = new DoublyLinkedList();
        this.capacity = capacity;
    }
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            return undefined;
        }
        this.list.moveToHead(node);
        return node.value;
    }
    put(key, value) {
        let node = this.cache.get(key);
        if (!node) {
            node = new Node(key, value);
            this.cache.set(key, node);
            this.list.append(node);
        }
        else {
            node.value = value;
            this.list.moveToHead(node);
        }
        if (this.list.size > this.capacity) {
            const lruNode = this.list.removeTail();
            if (lruNode) {
                this.cache.delete(lruNode.key);
            }
        }
    }
    delete(key) {
        const node = this.cache.get(key);
        if (!node) {
            return false;
        }
        this.list.removeNode(node);
        this.cache.delete(key);
        return true;
    }
    getKeysInOrder() {
        const keys = [];
        let current = this.list.head;
        while (current) {
            keys.push(current.key);
            current = current.next;
        }
        return keys;
    }
}
function main() {
    try {
        const input = fs.readFileSync(0, "utf8");
        const lines = input.trim().split('\n');
        if (lines.length === 0) {
            console.log("EMPTY");
            console.log("EMPTY");
            return;
        }
        const [C, N] = lines[0].split(/\s+/).map(Number);
        const cache = new LRUCache(C);
        const getResults = [];
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(/\s+/).filter(p => p.length > 0);
            const command = parts[0];
            switch (command) {
                case 'PUT':
                    const key = parts[1];
                    const value = parseInt(parts[2], 10);
                    cache.put(key, value);
                    break;
                case 'GET':
                    const key = parts[1];
                    const result = cache.get(key);
                    getResults.push(result === undefined ? -1 : result);
                    break;
                case 'DEL':
                    const key = parts[1];
                    cache.delete(key);
                    break;
            }
        }
        const getOutput = getResults.length > 0 ? getResults.join(' ') : "EMPTY";
        const remainingKeys = cache.getKeysInOrder().join(' ');
        console.log(getOutput);
        console.log(remainingKeys);
    }
    catch (error) {
        // Handle potential file system or parsing errors gracefully
        console.error("Error processing input:", error instanceof Error ? error.message : error);
    }
}
main();
