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
function main() {
    const input = fs.readFileSync(0, 'utf8').trim().split('\n');
    const firstLine = input[0].split(' ');
    const capacity = parseInt(firstLine[0], 10);
    const n = parseInt(firstLine[1], 10);
    const head = new Node('', 0);
    const tail = new Node('', 0);
    head.next = tail;
    tail.prev = head;
    const map = new Map();
    let size = 0;
    const getResults = [];
    function removeNode(node) {
        if (node.prev)
            node.prev.next = node.next;
        if (node.next)
            node.next.prev = node.prev;
    }
    function addNodeToHead(node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
    function moveNodeToHead(node) {
        removeNode(node);
        addNodeToHead(node);
    }
    for (let i = 1; i <= n; i++) {
        const line = input[i].split(' ');
        const op = line[0];
        if (op === 'PUT') {
            const key = line[1];
            const value = parseInt(line[2], 10);
            if (map.has(key)) {
                const node = map.get(key);
                node.value = value;
                moveNodeToHead(node);
            }
            else {
                if (size === capacity) {
                    const lruNode = tail.prev;
                    removeNode(lruNode);
                    map.delete(lruNode.key);
                    size--;
                }
                const node = new Node(key, value);
                addNodeToHead(node);
                map.set(key, node);
                size++;
            }
        }
        else if (op === 'GET') {
            const key = line[1];
            if (map.has(key)) {
                const node = map.get(key);
                moveNodeToHead(node);
                getResults.push(node.value);
            }
            else {
                getResults.push(-1);
            }
        }
        else if (op === 'DEL') {
            const key = line[1];
            if (map.has(key)) {
                const node = map.get(key);
                removeNode(node);
                map.delete(key);
                size--;
            }
        }
    }
    if (getResults.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(getResults.join(' '));
    }
    let current = head.next;
    const keys = [];
    while (current !== tail) {
        keys.push(current.key);
        current = current.next;
    }
    if (keys.length === 0) {
        console.log('EMPTY');
    }
    else {
        console.log(keys.join(' '));
    }
}
main();
