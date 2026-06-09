class ListNode {
        key: string;
        value: number;
        prev: ListNode | null;
        next: ListNode | null;
        constructor(key: string, value: number) {
            this.key = key;
            this.value = value;
            this.prev = null;
            this.next = null;
        }
    }

    class LRUCache {
        private capacity: number;
        private map: Map<string, ListNode>;
        private head: ListNode;
        private tail: ListNode;

        constructor(capacity: number) {
            this.capacity = capacity;
            this.map = new Map();
            this.head = new ListNode("", 0);
            this.tail = new ListNode("", 0);
            this.head.next = this.tail;
            this.tail.prev = this.head;
        }

        private remove(node: ListNode) {
            node.prev!.next = node.next;
            node.next!.prev = node.prev;
        }

        private addToHead(node: ListNode) {
            node.next = this.head.next;
            node.prev = this.head;
            this.head.next!.prev = node;
            this.head.next = node;
        }

        // ... logic ...
    }
