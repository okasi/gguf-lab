"use strict";
The;
user;
wants;
a;
TypeScript;
program;
for (Node.js; that; solves)
    the;
"Count Intervals Covering Points";
problem.
    ** Algorithm;
Selection:  **
    The;
problem;
asks;
for (an; $O((N + Q), log, N); $)
    algorithm;
or;
better.
    - $N$;
is;
the;
number;
of;
intervals.
    - $Q$;
is;
the;
number;
of;
queries.
;
A;
standard;
approach;
for (this; type; of)
    problem(counting, intervals, covering, points);
is;
to;
use;
a ** Sweep;
Line ** algorithm;
combined;
with (a ** Binary)
    Indexed;
Tree(Fenwick, Tree) ** or ** Segment;
Tree ** .However, since;
the;
coordinates;
can;
be ^ 9;
$, we;
need;
coordinate;
compression.
    Wait, let;
's look at the constraints and requirements again.
    - $N, Q;
le;
200, 0;
$.
    - Coordinates;
range;
$[-10 ^ 9, 10 ^ 9];
$.
;
If;
we;
use;
a;
simple;
array - based;
Segment;
Tree, the;
size;
would;
be;
too;
large($4, times, 10 ^ 9, $).So, Coordinate;
Compression + Segment;
Tree;
or;
Fenwick;
Tree;
is;
the;
way;
to;
go.
    However, there;
is;
a;
specific;
constraint: "Preserve the original query order.";
This;
implies;
we;
cannot;
sort;
the;
queries;
arbitrarily;
unless;
we;
track;
their;
original;
indices.
    Let;
's refine the algorithm:;
1. ** Coordinate;
Compression ** ;
Collect;
all;
unique;
endpoints($l, r$);
and;
query;
points.Map;
them;
to;
a;
smaller;
range;
$[0, M];
$.
;
2. ** Event;
Creation ** ;
    * For;
each;
interval;
$[l, r];
$, create;
two;
events: 
    * $(l, +1);
$ - Start;
of;
interval.
    * $(r + 1, -1);
$ - End;
of;
interval(exclusive, start, of, gap).
    * For;
each;
query;
point;
$p$, create;
an;
event: 
    * $(p, text, { query }, text, { index });
$.
;
3. ** Sorting ** ;
Sort;
all;
events;
by;
coordinate.If;
coordinates;
are;
equal, process;
order;
matters: usually;
starts;
before;
queries;
before;
ends(to, handle, boundaries, correctly, e.g., point, $x$, inside, $[x, x], $).Actually, standard;
sweep;
line;
logic: 
    * Process;
all;
events;
at;
$coord$.
    * Update;
the;
data;
structure(Fenwick, Tree);
with (the)
    counts.
        * Record;
answers;
for (queries; at; this)
    coord.
    ;
4. ** Data;
Structure ** ;
A;
Fenwick;
Tree(Binary, Indexed, Tree);
supports;
point;
updates;
and;
prefix;
sum;
queries in $O(log, M);
$.
    * Wait, the;
classic;
Fenwick;
Tree;
approach;
works;
well;
when;
we;
just;
need;
the;
count;
at;
a;
specific;
point.
    * Actually, the;
standard;
"Sweep Line + BIT";
approach;
is: 
    * Compress;
coordinates.
    * Add;
all;
interval;
starts;
to;
BIT;
at;
compressed;
index.
    * Add;
all;
interval;
ends;
to;
BIT.
    * Query;
the;
BIT;
at;
compressed;
query;
point.
    * Specifically;
Iterate;
through;
sorted;
unique;
coordinates.Maintain;
a;
counter.When;
hitting;
a;
start, increment;
counter.When;
hitting;
an;
end, decrement;
counter.When;
hitting;
a;
query, record;
current;
counter.
    * Is;
this;
$O((N + Q), log, N);
$ ? Sorting : ;
takes;
$O((N + Q), log(N + Q));
$.Iteration;
is;
linear.If;
we;
use;
a;
BIT;
for (the; counts, it; 's logarithmic per operation. But actually, since we are just counting how many intervals are active, we can just maintain a single integer counter if we process events in order.
    * Let)
    's check the logic:
        * Sort;
events;
by;
position.
    * Current;
Active;
Intervals = 0.
    * Loop;
through;
sorted;
positions: 
    * At;
position;
$x$, apply;
all;
changes(add / remove, intervals).
    * Record;
answer;
for (any; queries; at)
    $x$.
        * This;
is;
actually;
$O(N + Q);
$;
after;
sorting.Sorting;
is;
the;
bottleneck: $O((N + Q), log(N + Q));
$.Since;
$N, Q$;
are;
up;
to;
$2;
times;
10 ^ 5;
$, this;
fits;
comfortably;
within;
typical;
time;
limits(usually, 1 - 2, seconds).
    * Wait, does;
the;
prompt;
require;
strictly;
$O((N + Q), log, N);
$ ? "Use an O((N + Q) log N) algorithm or better."
    * The : ;
Sweep;
Line + Sorting;
is;
$O((N + Q), log(N + Q));
$.This;
requirement.
    * Using;
a;
Segment;
Tree / Fenwick;
Tree;
without;
sorting;
queries;
is;
$O((N + Q), log, N);
$.
    * Let;
's stick to the most robust method: **Coordinate Compression + Fenwick Tree / Segment Tree**. Or simply **Sorting Events**.
    * Actually, the;
simplest;
implementation;
for (Node.js; given; the)
    constraints;
is;
usually: 1.;
Collect;
all;
points(intervals, and, queries).
;
2.;
Compress.
;
3.;
Use;
a;
Fenwick;
Tree.
;
4.;
Process;
queries in sorted;
order ? No : , output;
must;
preserve;
original;
order.
;
5.;
So, store;
answers in an;
array;
indexed;
by;
original;
query;
index.
    * Let;
's detail the Fenwick Tree approach:
    * Coordinates;
$l, r, q_i$.
    * Compress;
to;
$0..K$.
    * Add;
intervals: Update;
range;
$[l, r];
$;
by + 1.(Range, update, point, query).
    * Query;
Get;
value;
at;
$q_i$.
    * Range;
update;
on;
BIT;
requires;
two;
point;
updates(difference, array, technique).
    * Time;
Complexity: $O(N, log, K + Q, log, K);
$.With;
compression, $K;
le;
2(N + Q);
$.So;
$O((N + Q), log, N);
$.This;
meets;
the;
requirement;
perfectly.
    * Alternative;
 ** Offline;
queries;
with (sorting ** .
    * Create)
    events: $(pos, type, id);
$.
    * Sort;
events.
    * Scan;
and;
count.
    * This;
is;
$O((N + Q), log(N + Q));
$.It;
is;
effectively;
the;
same;
complexity;
class {
}
    * It;
might;
be;
slightly;
faster in practice;
due;
to;
lower;
constant;
factors;
compared;
to;
BIT;
overhead, but;
BIT;
is;
very;
safe.
    * However, the;
problem;
statement;
"Preserve the original query order";
suggests;
handling;
queries;
individually.
    * Let;
's implement the **Fenwick Tree** approach as it explicitly uses the $\log N$ factor mentioned in the constraint.
    * Wait, one;
detail: "Handle negative coordinates".
    * JavaScript `Map`;
handles;
negative;
keys;
fine.
    * Compression;
maps;
negatives;
to;
positive;
integers;
easily.
    * Another;
detail: "Duplicate intervals/query points".
    * Compression;
handles;
duplicates;
naturally(same, mapped, value).
    * Multiple;
intervals;
starting / ending;
at;
same;
point;
works;
fine;
with (BIT.
    * Let)
    's verify the constraints again.
        * $N, Q;
le;
200, 0;
$.
    * Time;
limit;
is;
likely;
standard(1 - 2, s).
    * Memory;
limit;
is;
usually;
sufficient;
for (arrays of size)
    $400, 0;
$.
    * TypeScript;
on;
Node.js.Input;
via `fs.readFileSync(0, "utf8")`.
    *  ** Implementation;
Plan ** ;
1.;
Read;
input;
string.
;
2.;
Parse;
N, Q.
;
3.;
Read;
intervals, store;
separately.
;
4.;
Read;
queries, store;
with (original)
    index.
    ;
5.;
Coordinate;
Compression: 
    * Gather;
all;
$l, r$;
and;
query;
points;
into;
a;
list.
    * Sort;
unique;
values.
    * Create;
map;
from;
value;
to;
rank(0 - based, or, 1 - based).
;
6.;
Initialize;
Fenwick;
Tree(size = number, of, unique, coords).
;
7.;
Add;
Intervals: 
    * For;
each;
$[l, r];
$, update;
range;
$[l, r];
$;
by + 1.
    * In;
BIT, range;
update;
$(l, r);
$;
is `update(l, 1)`, `update(r+1, -1)`.
    * Note;
Since;
we;
compressed, we;
use;
compressed;
indices.
;
8.;
Answer;
Queries: 
    * For;
each;
query;
point;
$q$(using, original, index), get;
value;
at;
$q$.
    * Store in result;
array.
;
9.;
Print;
result;
array.
    *  ** Wait ** , is;
Range;
Update + Point;
Query;
the;
best;
fit ?
        * Yes : , because;
we;
want;
to;
know;
how;
many;
intervals;
cover;
a;
point.
    * Adding;
an;
interval;
$[l, r];
$;
means;
every;
point in $[l, r];
$;
gets + 1.
    * This;
is;
exactly;
what;
a;
range;
update;
does.
    * Querying;
a;
point;
is;
$O(log, N);
$.
    * Total;
complexity: $N$;
updates($O(N, log, N), $) + $Q$;
queries($O(Q, log, N), $) = $O((N + Q), log, N);
$.
    *  ** Optimization ** ;
    * Instead;
of;
full;
range;
update, we;
can;
treat;
intervals
    * But;
BIT;
is;
very;
robust.
    * Let;
's consider the "Sweep Line" vs "BIT".
    * Sweep;
Line: 
    * Events;
$(x, delta, isQuery, index);
$.
    * Sort;
events;
by;
$x$.
    * Current;
count = 0.
    * Loop;
events: 
    * If;
not;
query: `currentCount += delta`.
    * If;
query: `ans[index] = currentCount`.
    * This;
is;
$O((N + Q), log(N + Q));
$.It;
avoids;
the;
overhead;
of;
the;
BIT;
class and {
}
is;
easier;
to;
code.
    * Does;
it;
meet;
"O((N + Q) log N)" ? Yes : , $;
log(N + Q);
$;
is;
essentially;
$;
log;
N$.
    * Is;
it;
"or better" ? Yes.
    * However : , sometimes;
"Sweep Line";
implies;
processing in order.The;
prompt;
doesn;
't restrict the method.
    * Let;
's go with the **Fenwick Tree** approach as it feels more "algorithmic" and explicitly utilizes the log factor often expected in competitive programming contexts for this specific constraint description. Also, it handles the "Range Update" semantics directly.
    *  ** Wait ** , I;
need;
to;
be;
careful;
about;
the;
input;
parsing.
    * First;
line: `N Q`
    * Next;
N;
lines: `l r`
    * Last;
line: `Q integers`
    * Input;
format;
description: `Last line: Q integers, the query points`.
    * Wait, does;
"Last line";
mean * all * queries;
are;
on;
one;
line ? Or : ;
spread;
over;
lines ?
        * Standard : ;
competitive;
programming;
format;
usually;
allows;
splitting;
across;
lines;
or;
spaces.
    * "Last line: Q integers";
suggests;
they;
might;
be;
on;
one;
line, but;
robust;
parsers;
should;
handle;
whitespace;
generally.
    * Using `fs.readFileSync(0, "utf8")`;
gets;
everything.Splitting;
by;
whitespace(`\s`);
handles;
newlines;
and;
spaces;
uniformly.This;
is;
safer;
than;
assuming;
"lines".
    *  ** Constraints;
Check ** ;
    * $ - 10 ^ 9;
le;
l;
le;
r;
le;
10 ^ 9;
$.
    * TypeScript `number`;
is;
double;
precision;
float.Integers;
up;
to;
$2 ^ { 53:  } - 1;
$;
are;
safe.$10 ^ 9;
$;
is;
safe.
    * $N, Q;
le;
200, 0;
$.Array;
indices;
fit in `number`.
    *  ** Code;
Structure ** ;
    * Import `fs`.
    * Read;
file.
    * Parse;
tokens.
    * Implement;
FenwickTree;
class {
}
    * Main;
logic.
    * Output.
    *  ** Fenwick;
Tree;
Details ** ;
    * 1 - based;
indexing;
is;
easier;
for (BIT.
    * `update(i, val)`; ; )
    : adds `val`;
to;
index `i`.
    * `query(i)`;
returns;
sum;
from;
1;
to `i`.
    * Range;
update `[L, R]`;
by `val`;
`update(L, val)`, `update(R+1, -val)`.
    * Point;
query;
at `i`;
`query(i)`.
    * Wait, ;
if (I)
    do
        range;
    while (update `[L, R]`);
with (`+1`, the)
    prefix;
sum;
at `i`;
gives;
the;
count;
of;
intervals;
covering `i`.
    * Yes. `prefix_sum(i)`;
number;
of;
intervals;
starting;
$;
le;
i$;
minus;
number;
ending;
$ < i$.
    * Wait, logic;
check: 
    * Interval;
$[l, r];
$.Update;
$l$;
with ($ + 1)
    $, $r + 1;
$;
with ($ - 1)
    $.
        * Prefix;
sum;
at;
$x$: $;
sum_;
{
    j = 0;
}
 ^ x;
text;
{
    diff;
}
[j];
$.
    * If;
$x < l$, sum;
is;
0.
    * If;
$l;
le;
x < r + 1;
$, sum;
is;
1.
    * If;
$x;
ge;
r + 1;
$, sum;
is;
0.
    * Correct.
    *  ** Coordinate;
Compression ** ;
    * Need;
to;
map;
original;
values;
to;
$[0, M];
$.
    * Since;
we;
need;
to;
query `r+1`;
for (updates, we; must; ensure `r+1`)
    is;
also in the;
compression;
map.
    * Wait, ;
if (we)
    compress, `r+1`;
might;
not;
exist in the;
original;
data.
    * Example;
Intervals;
$[1, 2];
$.Query;
1.
    * Unique;
coords: $;
{
    1, 2;
}
$.
    * Update;
$[1, 2];
$.Need;
to;
update;
index;
of;
1(+1), index;
of;
3(-1).
    * If;
3;
is;
not in the;
set;
of;
unique;
coords, we;
need;
to;
insert;
it;
or;
handle;
the;
mapping;
carefully.
    * Better;
approach: Collect;
all;
relevant;
points.
    * All;
$l$.
    * All;
$r$.
    * All;
$r + 1;
$();
for (updates;;)
    .
        * All;
query;
points.
    * Sort;
unique;
points.
    * Map;
value -  > index.
    * This;
ensures `r+1`;
exists;
or;
we;
find;
the;
correct;
position;
for (it.
    * Actually, simpler; ; )
    : Just;
collect;
all;
$l, r, q$.Then;
for (each; interval, we; update `lower_bound(l)`)
    and `lower_bound(r+1)`.
        * Wait, `r+1`;
might;
fall;
between;
existing;
points.
    * Example;
Points;
$;
{
    1, 5;
}
$.Interval;
$[1, 5];
$.Query;
5.
    * We;
want;
to;
update;
range;
$[1, 5];
$.
    * Compressed;
indices: 1 -  > 0, 5 -  > 1.
    * We;
need;
to;
update;
index;
0;
with (+1.)
    We;
need;
to;
update;
index;
corresponding;
to;
6;
with (-1.
    * If)
    6;
is;
not in the;
list, we;
can;
't update it directly unless we expand the list.
    * Safer;
Include;
all;
$l, r, r + 1, q$ in the;
compression;
set.
    * Actually, even;
safer: Just;
include;
all;
$l, r, q$.When;
updating;
$[l, r];
$, find;
the;
index;
of;
$l$;
and;
the;
index;
of;
the * next * number;
after;
$r$.
    * But;
finding;
"next number";
requires;
binary;
search;
on;
the;
sorted;
unique;
array.
    * Easiest;
Construct;
the;
sorted;
unique;
array;
containing;
all;
$l, r, q$.Then;
for (each; interval, find; index)
    of;
$l$;
and;
index;
of;
$r$.
    * Wait, the;
update;
is;
$[l, r];
$.
    * BIT;
update;
needs;
indices.
    * If;
we;
map;
$x$;
to;
$idx(x);
$.
    * Update;
$idx(l);
$;
with ($ + 1)
    $.
        * Update;
$idx(r + 1);
$;
with ($ - 1)
    $.
        * If;
$r + 1;
$;
is;
not in the;
map, we;
can;
use `Math.floor`;
or;
similar ? No : , indices;
must;
be;
valid.
    * So, strictly;
speaking, we;
should;
collect;
all;
values;
$v$;
such;
that;
$v = l$;
or;
$v = r$;
or;
$v = q$;
or;
$v = r + 1;
$.
    * Given;
$N, Q$;
are;
small, we;
can;
just;
collect;
them;
all.
    * Actually, standard;
practice: 
    * Collect;
all;
$l, r, q$.
    * Sort;
unique.
    * For;
query;
at;
$q$, find;
index.
    * For;
interval;
$[l, r];
$, find;
index;
of;
$l$.Find;
index;
of;
$r$.
    * Wait, ;
if (we)
    update;
$[l, r];
$ in original;
coords, we;
update;
$[idx(l), idx(r)];
$ in compressed;
coords ?
        * No : , the;
values;
are;
not;
necessarily;
contiguous in the;
original;
space.
    * Example;
$l = 1, r = 100;
$.Query;
$q = 50;
$.
    * Unique;
$;
{
    1, 100, 50;
}
$.Sorted;
$;
{
    1, 50, 100;
}
$.
    * Indices;
$1;
to;
0, 50;
to;
1, 100;
to;
2;
$.
    * We;
want;
to;
count;
intervals;
covering;
50.
    * Interval;
$[1, 100];
$;
covers;
50.
    * Range;
update;
$[1, 100];
$.
    * In;
compressed: update;
index;
0(+1), update;
index;
3(-1) ? No : , index;
2(+1), index;
3(-1) ?
        * The : ;
logic;
holds;
if (we)
    treat;
the;
compressed;
indices;
continuous;
range.
    * Yes, because;
we;
only;
care;
about;
relative;
ordering.
    * So, ;
for (interval; $[l, r]; $, we)
    find `u = idx(l)`, `v = idx(r)`.
        * Update `BIT.update(u, 1)`, `BIT.update(v+1, -1)`.
        * Wait, `v+1`;
might;
be;
out;
of;
bounds;
of;
the;
BIT;
array.
    * BIT;
size;
should;
be `unique.length + 1`();
for (1 - based;;)
    or `unique.length + 2`.
        * Let;
's ensure `v+1` is within range.
    * Max;
index;
used;
is `max(idx(r)) + 1`.
    * Max `idx(r)`;
is `unique.length - 1`.
    * So;
we;
need;
BIT;
size `unique.length + 1`.
    * Wait, ;
if (`r`)
    is;
the;
largest;
value, `idx(r)`;
is;
max. `r+1`;
might;
be;
larger;
than;
any;
stored;
value.
    * But in terms;
of;
rank, `idx(r+1)`;
would;
be `idx(r) + 1`;
if (`r+1`)
    was in the;
set ? No.
    * The : ;
"rank";
of `r+1`;
is;
the;
number;
of;
unique;
values;
$;
le;
r + 1;
$.
    * Since `r`;
is in the;
set, `rank(r+1)`;
is `rank(r) + 1`(conceptually).
    * So;
we;
can;
just;
use `idx(r) + 1`;
index;
for (the; end; marker.
    * Wait, )
    if (we)
        have;
values;
$;
{
    1, 3;
}
$.Interval;
$[1, 3];
$.
    * `idx(1)=0`, `idx(3)=1`.
    * Update `idx(1)+1`(i.e., 1);
with (-1.
    * Query)
    at;
3;
`query(idx(3))` = `query(1)`.
    * Sum;
is `update(0, 1)` + `update(1, -1)`.
    * Prefix;
sum;
at;
1;
`1 - 1 = 0`.Correct.
    * Query;
at;
1;
`query(0)`.Sum;
is;
1.;
Correct.
    * So;
yes, using `idx(r) + 1`;
works;
perfectly;
index;
for (the; end; marker in the)
    BIT, provided;
the;
BIT;
is;
sized;
appropriately(at, least `max_idx + 2`).
    *  ** Edge;
Cases ** ;
    * $N;
0;
$;
or;
$Q = 0;
$ ? Constraints : ;
say;
$;
ge;
1;
$.
    * Negative;
numbers.JS;
handles `-10^9`;
fine.
    * Large;
numbers. `Math.floor`;
etc;
work.
    * Duplicate;
intervals: Handled;
by;
multiple;
updates.
    * Duplicate;
query;
points: Handled;
by;
multiple;
queries.
    *  ** Input;
Parsing ** ;
    * `fs.readFileSync(0, "utf8")`.
    * Split;
by `\s`.
    * Filter;
non - empty;
strings.
    * Map;
to `parseInt`.
    * This;
handles;
newlines;
and;
spaces;
uniformly.
    *  ** TypeScript;
Specifics ** ;
    * Use `const` / `let`.
    * Strict;
mode ? Default in TS.
    * No : ;
external;
dependencies.
    *  ** Performance ** ;
    * $N, Q = 2;
cdot;
10 ^ 5;
$.
    * Sorting;
$4;
cdot;
10 ^ 5;
log(4, cdot, 10 ^ 5);
$;
~$4;
cdot;
10 ^ 5;
cdot;
19;
$;
~$8;
cdot;
10 ^ 6;
$;
ops.Very;
fast.
    * BIT;
operations: $4;
cdot;
10 ^ 5;
cdot;
19;
$;
~$8;
cdot;
10 ^ 6;
$;
ops.Very;
fast.
    * Time;
limit;
is;
typically;
1;
s;
or;
2;
s.This;
is;
well;
within;
limits.
    *  ** Output;
Format ** ;
    * Space;
separated.
    * `process.stdout.write(ans.join(' ') + '\n')`.
    *  ** Drafting;
the;
Code ** ;
    * Import `fs`.
    * Class `FenwickTree`.
    * Main;
function () { }
    * Input;
reading.
    * Compression.
    * Processing.
    * Output.
    *  ** One;
Detail ** ;
"Return only the TypeScript code".
    * No;
markdown;
fence.
    * No;
explanation.
    *  ** Double;
Check;
Input;
Parsing ** ;
    * "First line: N Q".
    * "Next N lines: l r".
    * "Last line: Q integers".
    * My;
plan: Read;
all;
text, split;
by;
whitespace.This;
treats;
the;
whole;
input;
stream;
of;
tokens.
    * Token;
0;
N.Token;
1;
Q.
    * Tokens;
2;
to;
2 + N * 2 - 1;
Intervals.
    * Tokens;
2 + N * 2;
to;
end: Queries.
    * This;
is;
robust;
against;
line;
breaks;
within;
the;
sections.
    *  ** Wait ** , one;
edge;
on;
"Last line".
    * If;
the;
input;
is;
formatted;
strictly;
(N);
lines;
for (intervals, 1; line; )
    for (queries;;)
        , my;
token - based;
parser;
works;
perfectly.
    * If;
there;
are;
extra;
newlines, `split(/\s/)`;
handles;
them.
    *  ** Coordinate;
Compression;
Logic ** ;
    * Array `coords`;
stores;
all;
unique;
values.
    * Sort `coords`.
    * Map `val`;
to `index`.
    * Since;
values;
can;
be;
negative, `Map<number, number>`;
is;
good, or;
just;
binary;
search;
on;
sorted;
array.
    * Binary;
search;
on;
sorted;
array;
is;
$O(log, N);
$;
per;
lookup.$N + Q$;
lookups.$O((N + Q), log, N);
$.
    * Using;
a;
Map;
is;
$O(1);
$;
per;
lookup.
    * Given;
$N, Q;
le;
200, 0;
$, both;
are;
fine.Map;
is;
cleaner.
    *  ** Fenwick;
Tree;
Implementation ** ;
    * 1 - based;
indexing.
    * `tree`;
array.
    * `update(index, val)`.
    * `query(index)`.
    *  ** Wait ** , is;
there;
any;
where `r+1`;
overflows ?
        * $r : ;
le;
10 ^ 9;
$.$r + 1;
le;
10 ^ 9 + 1;
$.Fits in `number`.
    *  ** Final;
check;
on;
constraints ** ;
    * $N, Q;
le;
200, 0;
$.
    * $ - 10 ^ 9;
le;
l;
le;
r;
le;
10 ^ 9;
$.
    * Algorithm;
complexity;
satisfied.
    *  ** One;
small;
thing ** ;
The;
problem;
says;
"Return only the TypeScript code".
    * I;
should;
wrap;
it in a;
way;
that;
it;
runs;
script.
    * Usually `node index.ts`;
or;
similar.
    * Just;
the;
code;
block;
is;
needed.
    *  ** Structure ** ;
    * `import * as fs from 'fs';`
    * `const input = fs.readFileSync(0, 'utf8').trim().split(/\s+/).map(Number);`
    * Parse `n`, `q`.
    * Loop `n`;
times;
to;
read;
intervals.
    * Read;
queries.
    * Compress.
    * BIT.
    * Output.
    *  ** Wait ** , I;
should;
check;
if (`fs`)
    is;
available in Node.js;
natively.Yes.
    * Does;
Node.js;
support;
ES;
Modules;
by;
In;
recent;
versions;
yes, but;
CommonJS;
is;
standard. `require`;
is;
safer;
for (generic; Node.js; scripts)
    unless `--experimental-modules`;
or `"type": "module"`;
is;
set.However, `readFileSync`;
is;
synchronous;
and;
works in both.
    * To;
be;
safe;
and;
idiomatic;
for (a; generic; Node.js)
    script, I;
'll use `require` or `import` depending on context. Since it';
s;
"TypeScript program", `import`;
is;
preferred, but `require`;
is;
more;
compatible;
without;
config.
    * Actually, standard `fs.readFileSync`;
is;
available;
globally in Node;
REPL / scripts;
usually;
via `require('fs')`.
    * I;
will;
write;
it;
script;
that;
can;
be;
run;
with (`ts-node`)
    or;
compiled.
    * I;
'll use `import * as fs from ';
fs;
';` as it';
s;
modern;
and;
works;
with (`ts-node`.
    * Wait, `fs.readFileSync(0, "utf8")` - `0`)
    is;
stdin;
file;
descriptor.
    * This;
works in Node.js.
    *  ** One;
nuance ** ;
"Preserve the original query order."
    * I;
will;
store;
queries;
    * Sort;
queries;
by `val`();
for (compression / processing;;)
    OR;
process;
them;
after;
building;
BIT.
    * Actually, ;
with (BIT, we)
    build;
the;
tree;
first, then;
query.
    * So;
we;
just;
iterate;
through;
the;
original;
queries;
array;
to;
get;
answers.
    * Wait, ;
if (we)
    use;
the;
"Sweep Line";
method(sorting, events), we;
process;
queries in sorted;
order.
    * If;
we;
use;
"BIT", we;
can;
query in any;
order.
    * Since;
I;
chose;
BIT, order;
is;
preserved;
naturally;
by;
iterating;
the `queries`;
array.
    *  ** Wait ** , I;
need;
to;
make;
sure;
I;
don;
't use `/dev/stdin`.
    * The;
prompt;
says;
"Do not use /dev/stdin."
    * `fs.readFileSync(0, ...)`;
uses;
file;
descriptor;
0, which;
is;
stdin.This;
complies.
    *  ** Code;
organization ** ;
    * Single;
file.
    * Top;
to;
bottom;
execution.
    *  ** Let;
's refine the parsing**:
    * Input;
tokens: 
    * `tokens[0]`;
N
    * `tokens[1]`;
Q
    * `tokens[2]`;
to `tokens[2 + 2*N - 1]` = Intervals.
    * `tokens[2 + 2*N]`;
to;
end = Queries.
    * This;
assumes;
no;
other;
whitespace. `trim().split(/\s+/)`;
handles;
newlines / spaces.
    *  ** Constraints;
on;
memory ** ;
    * `coords`;
array: $4;
cdot;
10 ^ 5;
$;
ints.;
~1.6;
MB.
    * `tree`;
array: $4;
cdot;
10 ^ 5;
$;
ints;
