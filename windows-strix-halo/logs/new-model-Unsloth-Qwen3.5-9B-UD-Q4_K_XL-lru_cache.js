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
function createNode(key, value) {
    return { key, value, prev: null, next: null };
}
function addToHead(cache, node) {
    if (cache.head === null) {
        cache.head = node;
        cache.tail = node;
    }
    else {
        node.next = cache.head;
        cache.head.prev = node;
        cache.head = node;
    }
}
function removeNode(cache, node) {
    const prev = node.prev;
    const next = node.next;
    if (prev) {
        prev.next = next;
    }
    else {
        cache.head = next;
    }
    if (next) {
        next.prev = prev;
    }
    else {
        cache.tail = prev;
    }
}
function moveToFront(cache, node) {
    removeNode(cache, node);
    addToHead(cache, node);
}
function deleteKey(cache, key) {
    const node = cache.map.get(key);
    if (node) {
        removeNode(cache, node);
        cache.map.delete(key);
    }
}
function put(cache, key, value) {
    if (cache.map.has(key)) {
        const node = cache.map.get(key);
        node.value = value;
        moveToFront(cache, node);
    }
    else {
        if (cache.capacity === 0)
            return;
        if (cache.map.size >= cache.capacity) {
            const tailNode = cache.tail;
            if (tailNode) {
                removeNode(cache, tailNode);
                cache.map.delete(tailNode.key);
            }
        }
        const node = createNode(key, value);
        cache.map.set(key, node);
        addToHead(cache, node);
    }
}
function get(cache, key) {
    if (cache.map.has(key)) {
        const node = cache.map.get(key);
        moveToFront(cache, node);
        return node.value;
    }
    return -1;
}
const data = fs.readFileSync(0, 'utf8');
const lines = data.trim().split('\n');
const [capacityStr, operationCountStr] = lines[0].split(' ');
const capacity = parseInt(capacityStr);
const n = parseInt(operationCountStr);
const cache = {
    map: new Map(),
    head: null,
    tail: null,
    capacity
};
const getResults = [];
const keys = [];
for (let i = 1; i <= n; i++) {
    const line = lines[i].trim();
    if (!line)
        continue;
    const parts = line.split(' ');
    const command = parts[0];
    switch (command) {
        case 'PUT':
            const keyPut = parts[1];
            const valuePut = parseInt(parts[2]);
            put(cache, keyPut, valuePut);
            break;
        case 'GET':
            const keyGet = parts[1];
            const valueGet = get(cache, keyGet);
            getResults.push(valueGet);
            break;
        case 'DEL':
            const keyDel = parts[1];
            deleteKey(cache, keyDel);
            break;
    }
}
let getOutput = 'EMPTY';
if (getResults.length > 0) {
    getOutput = getResults.join(' ');
}
let remainingOutput = 'EMPTY';
if (cache.head !== null) {
    let current = cache.head;
    while (current) {
        keys.push(current.key);
        current = current.next;
    }
    remainingOutput = keys.join(' ');
}
console.log(getOutput);
console.log(remainingOutput);
