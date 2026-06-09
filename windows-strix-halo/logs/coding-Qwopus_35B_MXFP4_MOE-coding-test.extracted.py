import sys

def main():
    input = sys.stdin.read
    data = input().split()
    
    iterator = iter(data)
    
    N = int(next(iterator))
    Q = int(next(iterator))
    
    events = []
    for _ in range(N):
        l = int(next(iterator))
        r = int(next(iterator))
        # Type 0: Interval start
        events.append((l, 0))
        # Type 2: Interval end
        events.append((r, 2))
        
    queries = []
    for i in range(Q):
        queries.append(int(next(iterator)))
        
    # Type 1: Query point
    for i, x in enumerate(queries):
        events.append((x, 1))
        
    # Sort events by coordinate. For equal coordinates:
    # 0 (start) < 1 (query) < 2 (end)
    # This ensures intervals starting at x are counted, and intervals ending at x are not removed yet.
    events.sort()
    
    active = 0
    answers = []
    for coord, type_ in events:
        if type_ == 0:
            active += 1
        elif type_ == 1:
            answers.append(active)
        elif type_ == 2:
            active -= 1
            
    print(" ".join(map(str, answers)))

if __name__ == "__main__":
    main()
