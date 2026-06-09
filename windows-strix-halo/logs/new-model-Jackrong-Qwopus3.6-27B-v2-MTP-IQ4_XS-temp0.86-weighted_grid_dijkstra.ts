class MinHeap {
    private data: number[][] = [];

    constructor() {}

    push(item: number[]): void {
        this.data.push(item);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): number[] | undefined {
        if (this.data.length === 0) return undefined;
        if (this.data.length === 1) return this.data.pop();
        const top = this.data[0];
        this.data[0] = this.data.pop()!;
        this.sinkDown(0);
        return top;
    }

    get size(): number {
        return this.data.length;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.data[parentIndex][0] <= this.data[index][0]) break;
            [this.data[parentIndex], this.data[index]] = [this.data[index], this.data[parentIndex]];
            index = parentIndex;
        }
    }

    private sinkDown(index: number): void {
        const length = this.data.length;
        while (true) {
            const leftIndex = 2 * index + 1;
            const rightIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftIndex < length && this.data[leftIndex][0] < this.data[smallestIndex][0]) {
                smallestIndex = leftIndex;
            }
            if (rightIndex < length && this.data[rightIndex][0] < this.data[smallestIndex][0]) {
                smallestIndex = rightIndex;
            }

            if (smallestIndex === index) break;
            [this.data[index], this.data[smallestIndex]] = [this.data[smallestIndex], this.data[index]];
            index = smallestIndex;
        }
    }
}
