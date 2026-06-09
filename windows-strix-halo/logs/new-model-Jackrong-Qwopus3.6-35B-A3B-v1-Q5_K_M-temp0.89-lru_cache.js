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
class DoublyLinkedList {
    constructor() {
        this.head = new Node('', -1);
        this.tail = new Node('', -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    addAtHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next = node;
        node.next.prev = node;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
    }
    removeLast() {
        if (this.tail.prev === this.head) {
            return null;
        }
        const last = this.tail.prev;
        this.remove(last);
        return last;
    }
    keysFromMostRecent() {
        const result = [];
        let current = this.head.next;
        while (current !== null && current !== this.tail) {
            result.push(current.key);
            current = current.next;
        }
        return result;
    }
}
function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const lines = input.split('\n');
    const [C, N] = lines[0].split(' ').map(Number);
    const cache = new Map();
    const dll = new DoublyLinkedList();
    const getResults = [];
    let size = 0;
    const processLine = (line) => {
        const parts = line.split(' ');
        const command = parts[0];
        if (command === 'PUT') {
            const key = parts[1];
            const value = Number(parts[2]);
            if (cache.has(key)) {
                const node = cache.get(key);
                node.value = value;
                dll.remove(node);
                dll.addAtHead(node);
            }
            else {
                if (size === C) {
                    const last = dll.removeLast();
                    if (last) {
                        cache.delete(last.key);
                        size--;
                    }
                }
                const node = new Node(key, value);
                dll.addAtHead(node);
                cache.set(key, node);
                size++;
            }
        }
        else if (command === 'GET') {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key);
                dll.remove(node);
                dll.addAtHead(node);
                getResults.push(node.value);
            }
            else {
                getResults.push(-1);
            }
        }
        else if (command === 'DEL') {
            const key = parts[1];
            if (cache.has(key)) {
                const node = cache.get(key);
                dll.remove(node);
                cache.delete(key);
                size--;
            }
        }
    };
    for (let i = 1; i <= N; i++) {
        processLine(lines[i]);
    }
    const getOutput = getResults.length === 0 ? 'EMPTY' : getResults.join(' ');
    const keysOutput = cache.size === 0 ? 'EMPTY' : dll.keysFromMostRecent().join(' ');
    console.log(getOutput);
    console.log(keysOutput);
}
solve();
