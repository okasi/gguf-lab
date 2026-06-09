"use strict";
 in the;
output.
    * No;
explanations.
    * Only;
TypeScript;
code.
;
2. ** Algorithm;
Design(Dijkstra);
 **
    * State;
`(row, col)`
    * Distance;
`dist[row][col]`
    * Priority;
Queue: Stores `{cost, row, col}`.
    * Initialization;
    * Parse;
input.
    * Find `S`;
coordinates.
    * Set `dist[S.row][S.col] = 0`.
    * Push `{0, S.row, S.col}`;
to;
PQ.
    * Loop;
    * Pop;
min `{c, r, col}`.
    * If `c > dist[r][col]`, ;
continue ;
    * If `(r, col)`;
is `T`, ;
return `c`.
    * For;
each;
neighbor `(nr, nc)`;
    * Check;
bounds.
    * Check;
if (not)
    wall(`#`).
        * Calculate;
edge;
weight `w`.
    * If;
grid[nr][nc];
is `0-9`, `w = parseInt(grid[nr][nc])`.
    * If;
grid[nr][nc];
is `S`;
or `T`, `w = 0`.
    * If;
grid[nr][nc];
is `#`, skip.
    * New;
cost `newDist = c + w`.
    * If `newDist < dist[nr][nc]`;
    * `dist[nr][nc] = newDist`.
    * Push `{newDist, nr, nc}`.
    * Termination;
If;
queue;
empty;
and `T`;
not;
found, ;
return -1.;
3. ** Input;
Parsing:  **
    * `fs.readFileSync(0, "utf8")`.
    * Split;
by;
newline.
    * First;
line: `H W`.
    * Next `H`;
lines: Grid;
rows.
    * Need;
to;
handle;
potential;
empty;
lines;
or;
trailing;
whitespace;
carefully, but;
standard;
competitive;
programming;
input;
usually;
implies;
valid;
structure.
    * Need;
to;
handle;
the;
grid;
characters;
properly.
;
4. ** Implementation;
Details:  **
    * Imports;
`fs`, `PriorityQueue`(standard, lib, doesn, 't have PQ, need to implement heap or use `min-heap` package, or simple array sort/heapify. Since it', s, a, standalone, script, implementing, a, simple, binary, heap, is, safer, to, avoid, external, dependencies).
    * Wait, standard;
TypeScript / Node;
usually;
allows `min-heap`;
or `heap`;
package, but;
to;
be;
self - contained;
and;
robust;
without `npm install`;
requirements in the;
code;
itself(assuming, the, environment, has, standard, libs), I;
should;
implement;
a;
min - heap;
class {
}
    * Alternatively, since `PriorityQueue`;
isn;
't standard in Node, I need to write one.
    * Grid;
parsing: Ensure `H`;
and `W`;
are;
read;
correctly.
    * Output;
`console.log(result)`.
;
5. ** Refining;
the;
Input;
Reading:  **
    * `const rawData = fs.readFileSync(0, "utf8");`
    * `const lines = rawData.split(/\r?\n/);`
    * `const [H, W] = lines[0].trim().split(/\s+/).map(Number);`
    * Loop `i`;
from;
1;
to `H`;
to;
get;
grid;
rows.
    * Need;
to;
ensure;
we;
don;
't access `lines` beyond `H` rows if there';
s;
extra;
data, but;
usually;
we;
consume;
exactly `H`;
lines.
;
6. ** Refining;
the;
Cost;
Logic:  **
    * "The start cell itself contributes 0."
    * "Entering S or T costs 0."
    * "digits 0..9 = passable cells with that cost to enter"
    * "The cost of the path is the sum of costs of entered digit cells."
    * So, moving;
from `S`;
to;
neighbor `X`;
cost;
is `cost(X)`.
    * Moving;
from `X`;
to;
neighbor `T`;
cost;
is `cost(T) = 0`.
    * Moving;
from `X`;
to;
neighbor `Y`;
cost;
is `cost(Y)`.
    * So;
when;
relaxing `(r, col)`, ;
if (neighbor)
    is `S`;
or `T`, weight;
is;
0.;
If;
digit, weight;
is;
digit.
    * Wait, what;
about;
the;
start;
cell ? "The start cell itself contributes 0." : ;
Initial;
distance;
is;
0.
    * What;
if (`S`)
    and `T`;
are;
same ? Distance : ;
0.
    * Need;
to;
check;
if (`S`)
    exists.Assume;
valid;
input;
per;
problem;
description.
;
7. ** Min - Heap;
Implementation:  **
    * Simple;
array;
based;
heap.
    * Methods;
`push`, `pop`.
    * Sorts;
by;
cost.
;
8. ** Edge;
Cases:  **
    * Unreachable;
Return - 1.
    * S;
and;
T;
adjacent: Cost;
of;
neighbor.
    * S;
or;
T;
surrounded;
by;
walls.
    * H;
or;
W;
is;
1.
    * Input;
might;
have;
empty;
lines;
at;
the;
end.
    * Input;
lines;
might;
contain;
spaces ? "Next H lines: grid characters." : ;
usually;
means;
string;
of;
characters.
    * Parsing `lines[0]`;
for (H; W.
    * Parsing; grid)
    rows: `lines[i]`;
for (`i`; from; 1)
    to `H`.
    ;
9. ** Code;
Structure:  **
    * Import;
fs.
    * Define;
Heap;
class {
}
    * Main;
logic.
    * Output.
;
10. ** Specific;
Constraint;
Check:  **
    * "Return only TypeScript code, no explanation and no Markdown fence." -  > I;
must;
not;
wrap;
the;
code in
;
