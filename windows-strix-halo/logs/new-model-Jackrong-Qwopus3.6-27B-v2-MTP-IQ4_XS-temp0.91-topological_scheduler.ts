const parent = (i - 1) >> 1;
    if (this.heap[parent] <= this.heap[i]) break;
    [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
    i = parent;
}
