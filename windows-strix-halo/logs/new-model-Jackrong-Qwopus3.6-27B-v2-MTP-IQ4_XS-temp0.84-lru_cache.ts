const fs = require('fs');

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

class LRUCache {
  private capacity: number;
  private size: number;
  private map: Map<string, Node>;
  private head: Node | null;
  private tail: Node | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.size = 0;
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  private addToFront(node: Node): void {
    node.prev = null;
    node.next = this.head;
    if (this.head !== null) {
      this.head.prev = node;
    }
    this.head = node;
    if (this.tail === null) {
      this.tail = node;
    }
    this.size++;
  }

  private removeNode(node: Node): void {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
    this.size--;
  }

  private moveToFront(key: string): void {
    const node = this.map.get(key);
    if (node) {
      this.removeNode(node);
      this.addToFront(node);
    }
  }

  public get(key: string): number {
    if (!this.map.has(key)) {
      return -1;
    }
    this.moveToFront(key);
    return this.map.get(key)!.value;
  }

  public put(key: string, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node!.value = value;
      this.moveToFront(key);
    } else {
      if (this.size === this.capacity) {
        const tailNode = this.tail!;
        this.map.delete(tailNode.key);
        this.removeNode(tailNode);
      }
      const newNode = new Node(key, value);
      this.addToFront(newNode);
      this.map.set(key, newNode);
    }
  }

  public del(key: string): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      this.removeNode(node);
      this.map.delete(key);
    }
  }

  public getKeysInOrder(): string[] {
    const keys: string[] = [];
    let current = this.head;
    while (current !== null) {
      keys.push(current.key);
      current = current.next;
    }
    return keys;
  }
}

function
