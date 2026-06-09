class MinHeap {
        private heap: string[] = [];
        push(val: string) {
            this.heap.push(val);
            this.bubbleUp(this.heap.length - 1);
        }
        pop(): string | undefined {
            if (this.heap.length === 0) return undefined;
            const top = this.heap[0];
            const last = this.heap.pop()!;
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.bubbleDown(0);
            }
            return top;
        }
        private bubbleUp(index: number) {
            while (index > 0) {
                let parent = Math.floor((index - 1) / 2);
                if (this.heap[index] < this.heap[parent]) {
                    [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]] ;
                    index = parent;
                } else break;
            }
        }
        private bubbleDown(index: number) {
            while (true) {
                let left = 2 * index + 1;
                let right = 2 * index + 2;
                let smallest = index;
                if (left < this.heap.length && this.heap[left] < this.heap[smallest])) {
                    smallest = left;
                }
                if (right < this.heap.length && this.heap[right] < this.heap[smallest])) {
                    smallest = right;
                }
                if (smallest !== index) {
                    [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]] ;
                    index = smallest;
                } else break;
            }
        }
        isEmpty(): boolean { return this.heap.length === 0; }
    }
