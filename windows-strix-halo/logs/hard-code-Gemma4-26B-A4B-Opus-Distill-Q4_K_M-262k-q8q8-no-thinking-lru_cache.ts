interface Node {
    key: string;
    value: number;
    prev: Node | null;
    next: Node | null;
}

class LRUCache {
    private capacity: number;
    private cache: Map<string, Node> = new Map();
    private head: Node | null = null;
    private tail: Node | null = null;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    private remove(node: Node) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
    }

    private moveToHead(node: Node) {
        this.remove(node);
        this.addToHead(node);
    }

    private addToHead(node: Node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) this.head.prev = node;
        this.head = node;
        if (!this.tail) this.tail = node;
    }

    get(key: string): number {
        const node = this.cache.get(key);
        if (!node) return -1;
        this.moveToHead(node);
        return node.value;
    }

    put(key: string, value: number) {
        const existing = this.cache.get(key);
        if (existing) {
            existing.value = value;
            this.moveToHead(existing);
        } else {
            if (this.cache.size >= this.capacity) {
                if (this.tail) {
                    this.cache.delete(this.tail.key);
                    this.remove(this.tail);
                }
            }
            const newNode: Node = { key, value, prev: null, next: this.head };
            if (this.head) this.head.prev = newNode;
            this.head = newNode;
            if (!this.tail) this.tail = newNode;
            this.cache.set(key, newNode);
        }
    }

    del(key: string) {
        const node = this.cache.get(key);
        if (node) {
            this.remove(node);
            this.cache.delete(key);
        }
    }

    getRemaining() {
        const res: string[] = [];
        let curr = this.head;
        while (curr) {
            res.push(curr.key);
            curr = curr.next;
        }
        return res;
    }
}

function solve() {
    const input = fs.readFileSync(0, "utf8");
    const lines = input.split(/\r?\n/);
    if (lines.length === 0) return;

    const firstLine = lines[0].trim().split(/\s+/);
    if (firstLine.length < 2) return;
    const C = parseInt(firstLine[0], 10);
    const N = parseInt(firstLine[1], 10);

    const cache = new LRUCache(C);
    const getResults: number[] = [];

    for (let i = 1; i <= N; i++) {
        if (!lines[i]) continue;
        const parts = lines[i].trim().split(/\s+/);
        const op = parts[0];

        if (op === "PUT") {
            const key = parts[1];
            const val = parseInt(parts[2], 10);
            cache.put(key, val);
        } else if (op === "GET") {
            const key = parts[1];
            getResults.push(cache.get(key));
        } else if (op === "DEL") {
            const key = parts[1];
            cache.del(key);
        }
    }

    process.stdout.write(getResults.length === 0 ? "EMPTY\n" : getResults.join(" ") + "\n");
    const remaining = cache.getRemaining();
    process.stdout.write(remaining.length === 0 ? "EMPTY\n" : remaining.join(" ") + "\n");
}

solve();
