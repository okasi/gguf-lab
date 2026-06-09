class MinHeap {
            private heap: string[] = [];
             push(val: string) {
                 this.heap.push(val);
                 this.bubbleUp(this.heap.length - 1);
             }
              pop(): string | undefined {
                 if (this.heap.length === 0) return undefined;
                 if (this.heap.length === 1) return this.heap.pop();
                 const top = this.heap[0];
                 this.heap[0] = this.heap.pop()!;
                 this.bubbleDown(0);
                 return top;
             }
              private bubbleUp(idx: number) {
                 while (idx > 0) {
                     let parent = Math.floor((idx - 1) / 2);
                     if (this.heap[idx] < this.heap[parent]) {
                         [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
                         idx = parent;
                     } else break;
                 }
             }
              private bubbleDown(idx: number) {
                 while (true) {
                     let left = 2 * idx + 1;
                     let right = 2 * idx + 2;
                     let smallest = idx;
                     if (left < this.heap.length && this.heap[left] < this.heap[smallest]) smallest = left;
                     if (right < this.heap.length && this.heap[right] < this.heap[smallest]) smallest = right;
                     if (smallest !== idx) {
                         [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                         idx = smallest;
                     } else break;
                 }
             }
              size(): number { return this.heap.length; }
        }
