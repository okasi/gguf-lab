import * as fs from 'fs';

class Node {
  key: string;
  value: number;
  prev: Node | null;
  next: Node | null;

  constructor(key: string, value: number) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  private head: Node;
  private tail: Node;

  constructor() {
    this.head = new Node('', -1);
    this.tail = new Node('', -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addAtHead(node: Node): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next = node;
    node.next!.prev = node;
  }

  remove(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  removeLast(): Node | null {
    if (this.tail.prev === this.head) {
      return null;
    }
    const last = this.tail.prev;
    this.remove(last);
    return last;
  }

  keysFromMostRecent(): string[] {
    const result: string[] = [];
    let current: Node | null = this.head.next;
    while (current !== null && current !== this.tail) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }
}

function solve(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split('\n');
  const [C, N] = lines[0].split(' ').map(Number);

  const cache = new Map<string, Node>();
  const dll = new DoublyLinkedList();
  const getResults: number[] = [];
  let size = 0;

  const processLine = (line: string): void => {
    const parts = line.split(' ');
    const command = parts[0];

    if (command === 'PUT') {
      const key = parts[1];
      const value = Number(parts[2]);

      if (cache.has(key)) {
        const node = cache.get(key)!;
        node.value = value;
        dll.remove(node);
        dll.addAtHead(node);
      } else {
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
    } else if (command === 'GET') {
      const key = parts[1];
      if (cache.has(key)) {
        const node = cache.get(key)!;
        dll.remove(node);
        dll.addAtHead(node);
        getResults.push(node.value);
      } else {
        getResults.push(-1);
      }
    } else if (command === 'DEL') {
      const key = parts[1];
      if (cache.has(key)) {
        const node = cache.get(key)!;
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
