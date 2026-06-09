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
        private map: Map<string, Node>;
        private head: Node | null;
        private tail: Node | null;

        constructor(capacity: number) {
            this.capacity = capacity;
            this.map = new Map();
            this.head = null;
            this.tail = null;
        }

        private removeNode(node: Node) {
            if (node.prev) node.prev.next = node.next;
            else this.head = node.next;

            if (node.next) node.next.prev = node.prev;
            else this.tail = node.prev;
        }

        private addToHead(node: Node) {
            node.next = this.head;
            node.prev = null;
            if (this.head) this.head.prev = node;
            this.head = node;
            if (!this.tail) this.tail = node;
        }

        public get(key: string): number {
            const node = this.map.get(key);
            if (!node) return -1;
            this.removeNode(node);
            this.addToHead(node);
            return node.value;
        }

        public put(key: string, value: number): void {
            const node = this.map.get(key);
            if (node) {
                node.value = value;
                this.removeNode(node);
                this.addToHead(node);
            } else {
                if (this.map.size >= this.capacity) {
                    if (this.tail) {
                        this.map.delete(this.tail.key);
                        this.removeNode(this.tail);
                    }
                }
                const newNode = new Node(key, value);
                this.map.set(key, newNode);
                this.addToHead(newNode);
            }
        }

        public del(key: string): void {
            const node = this.map.get(key);
            if (node) {
                this.removeNode(node);
                this.map.delete(key);
            }
        }

        public getKeys(): string[] {
            const keys: string[] = [];
            let curr = this.head;
            while (curr) {
                keys.push(curr.key);
                curr = curr.next;
            }
            return keys;
        }
    }
