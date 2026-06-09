"use strict";
class ListNode {
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
        this.head = new ListNode("", 0);
        this.tail = new ListNode("", 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    addToHead(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }
}
