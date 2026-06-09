import * as fs from 'fs';

function solve(): void {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\s+/);
    let idx = 0;

    const N = parseInt(input[idx++], 10);
    const Q = parseInt(input[idx++], 10);

    const intervals: [number, number][] = [];
    for (let i = 0; i < N; i++) {
        const l = parseInt(input[idx++], 10);
        const r = parseInt(input[idx++], 10);
        intervals.push([l, r]);
    }

    const queries: number[] = [];
    for (let i = 0; i < Q; i++) {
        queries.push(parseInt(input[idx++], 10));
    }

    // Collect all critical points: interval starts, interval ends+1, and query points
    // We need to associate each critical point with its type and index to preserve order
    interface CriticalPoint {
        coord: number;
        type: 'start' | 'end' | 'query';
        index: number; // For queries, this is the query index; for intervals, not used in final output
    }

    const criticalPoints: CriticalPoint[] = [];

    // Add interval boundaries
    for (let i = 0; i < N; i++) {
        const [l, r] = intervals[i];
        criticalPoints.push({ coord: l, type: 'start', index: i });
        criticalPoints.push({ coord: r + 1, type: 'end', index: i });
    }

    // Add query points
    for (let i = 0; i < Q; i++) {
        criticalPoints.push({ coord: queries[i], type: 'query', index: i });
    }

    // Sort critical points by coordinate, then by type:
    // 'start' comes before 'query', 'query' comes before 'end'
    // This ensures that at a point x:
    // - All intervals starting at x are counted
    // - All queries at x are processed
    // - All intervals ending at x-1 (i.e., end+1 = x) are removed
    criticalPoints.sort((a, b) => {
        if (a.coord !== b.coord) {
            return a.coord - b.coord;
        }
        // Order: start < query < end
        const typeOrder: { [key: string]: number } = { 'start': 0, 'query': 1, 'end': 2 };
        return typeOrder[a.type] - typeOrder[b.type];
    });

    // Sweep line
    let currentCount = 0;
    const answers: number[] = new Array(Q);

    for (const cp of criticalPoints) {
        if (cp.type === 'start') {
            currentCount++;
        } else if (cp.type === 'end') {
            currentCount--;
        } else { // query
            answers[cp.index] = currentCount;
        }
    }

    // Output answers space-separated
    console.log(answers.join(' '));
}

solve();
