import * as fs from 'fs';

interface Node {
  key: string;
  value: number;
  prev: Node | null;
  next: Node | null;
}

interface Cache {
  map: Map<string, Node>;
  head: Node | null;
  tail: Node | null;
  capacity: number;
}

function createNode(key: string, value: number): Node {
  return { key, value, prev: null, next: null };
}

function addToHead(cache: Cache, node: Node): void {
  if (cache.head === null) {
    cache.head = node;
    cache.tail = node;
  } else {
    node.next = cache.head;
    cache.head.prev = node;
    cache.head = node;
  }
}

function removeNode(cache: Cache, node: Node): void {
  const prev = node.prev;
  const next = node.next;

  if (prev) {
    prev.next = next;
  } else {
    cache.head = next;
  }

  if (next) {
    next.prev = prev;
  } else {
    cache.tail = prev;
  }
}

function moveToFront(cache: Cache, node: Node): void {
  removeNode(cache, node);
  addToHead(cache, node);
}

function deleteKey(cache: Cache, key: string): void {
  const node = cache.map.get(key);
  if (node) {
    removeNode(cache, node);
    cache.map.delete(key);
  }
}

function put(cache: Cache, key: string, value: number): void {
  if (cache.map.has(key)) {
    const node = cache.map.get(key)!;
    node.value = value;
    moveToFront(cache, node);
  } else {
    if (cache.capacity === 0) return;

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

function get(cache: Cache, key: string): number {
  if (cache.map.has(key)) {
    const node = cache.map.get(key)!;
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

const cache: Cache = {
  map: new Map(),
  head: null,
  tail: null,
  capacity
};

const getResults: number[] = [];
const keys: string[] = [];

for (let i = 1; i <= n; i++) {
  const line = lines[i].trim();
  if (!line) continue;

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
