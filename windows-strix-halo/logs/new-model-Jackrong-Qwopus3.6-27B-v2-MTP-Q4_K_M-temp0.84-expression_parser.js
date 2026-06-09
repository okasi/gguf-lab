"use strict";
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
function intDiv(a, b) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
        if (b === 0)
            throw new Error("Division by zero");
        const q = Math.trunc(a / b);
        const r = a - q * b;
        // For truncation toward zero, we require:
        // if a >= 0: r >= 0 and r < |b|
        // if a < 0: r <= 0 and |r| < |b|
        // If these hold, q is correct.
        // Otherwise, adjust q.
        if (a >= 0) {
            if (r < 0) {
                // q is too high
                q--;
                // after decrement, r becomes r + b, which should be positive and < b
            }
            else if (r >= b) {
                // q is too low
                q++;
                // r becomes r - b, should be non-negative and < b
            }
        }
        else {
            if (r > 0) {
                // q is too low? Let's derive: a negative, b positive or negative.
                // For a < 0, we want r <= 0 and |r| < |b|.
                // If r > 0, that means a - q*b > 0 => a > q*b.
                // Since a negative, if b positive, q negative, q*b negative, a > q*b means a less negative? Actually, need careful.
                // Better to use absolute values.
                // We can convert to positive division and then adjust sign.
            }
        }
        But;
        the;
        above;
        approach;
        with (checking)
            r;
        might;
        be;
        simpler: compute;
        q = Math.trunc(a / b).Then;
        compute;
        r = a - q * b.If;
        r != 0, check;
        if (Math.abs(r) >= Math.abs(b).If)
            so, then;
        q;
        is;
        too;
        small();
        if (r)
            has;
        same;
        sign;
        or;
        too;
        large();
        if (opposite)
            .Actually, ;
        if ( | r |  >=  | b | , then)
            we;
        can;
        adjust;
        q;
        by;
        adding;
        sign(a) * sign(b) ? Let : ;
        's think.;
        We;
        want;
        q;
        such;
        that;
        a = q * b + r, ;
        with (0 <=  | r | sign(r))
             = sign(a);
        or;
        r = 0.;
        If | r |  >=  | b | , then;
        q;
        is;
        not;
        the;
        truncated;
        quotient.The;
        direction;
        of;
        adjustment: if (r)
            has;
        the;
        same;
        sign, then;
        q;
        is;
        too;
        small(because, the, remainder, is, too, large in the, same, direction).If;
        r;
        has;
        opposite;
        sign, then;
        q;
        is;
        too;
        large.So;
        we;
        can;
        adjust: while (Math.abs(r) >= Math.abs(b)) {
            if (sign(r) === sign(a))
                q += sign(b);
            else
                q -= sign(b);
        }
        but;
        that;
        might;
        need;
        multiple;
        adjustments;
        if (error)
            is;
        more;
        than;
        1, but;
        likely;
        at;
        most;
        1.;
        But;
        we;
        can;
        simplify: compute;
        q = Math.trunc(a / b).Then;
        compute;
        r = a - q * b.If;
        r != 0;
        and;
        Math.abs(r) >= Math.abs(b), then;
        if (a > 0 && r > 0)
            q++;
        else if (a > 0 && r < 0)
            q--;
        else if (a < 0 && r < 0)
            q++;
        else if (a < 0 && r > 0)
            q--;
        But;
        need;
        to;
        be;
        careful;
        with (signs)
            of;
        b.Actually, the;
        condition;
        r < 0;
        when;
        a > 0;
        means;
        q * b > a, so;
        q;
        too;
        high, decrement.When;
        a > 0;
        and;
        r > 0;
        and;
        r >= b, q;
        too;
        low, increment.When;
        a < 0;
        and;
        r < 0;
        and | r |  >=  | b | , q;
        too;
        low ? Let : ;
        's test: a=-5, b=2, true q=-2, r=-1. Suppose q from Math.trunc is -3? That would give r = -5 - (-3*2)= -5+6=1, which is >0, and |r|<2, but r>0, a<0, so that would be an error? Actually, if q=-3, then r=1, which is positive, but a negative, so remainder has opposite sign, and |r|<2, but the condition for truncation toward zero is that remainder should have same sign as dividend or be zero. So r=1 is not allowed. So q=-3 is too low? Because -3*2 = -6, which is less than -5, so remainder positive. To get remainder with same sign, we need q = -2. So if r>0 when a<0, q is too low, we need to increase q (make it less negative). So increment q. Similarly, if a<0 and r<0 and |r|>=|b|, then q is too high? Let';
        s;
        test: a = -5, b = 2, ;
        if (q = -1, then)
            r = -5 - (-2);
        -3,  | r;
        3 >= 2, r;
        negative, a;
        negative, same;
        sign;
        but;
        magnitude;
        too;
        large, so;
        q;
        too;
        high ? Actually : , -1 * 2;
        -2, which;
        is;
        greater;
        than - 5 ? Wait : , -2 > -5, so;
        q = -1;
        gives;
        product - 2, which;
        is;
        larger;
        than;
        a, so;
        remainder;
        negative;
        and;
        large;
        magnitude.So;
        q;
        is;
        too;
        high(less, negative), we;
        need;
        to;
        decrease;
        q(more, negative).So;
        decrement;
        q.
        ;
        So;
        the;
        adjustment;
        rule: if (r != 0)
            : -If;
        sign(r) != sign(a);
        q;
        is;
        too;
        high;
        if (a > 0 ? Actually : , sign(r) != sign(a))
            means;
        remainder;
        has;
        opposite;
        sign.That;
        indicates;
        that;
        q * b;
        is;
        on;
        the;
        other;
        side;
        of;
        a.For;
        a > 0, r < 0;
        means;
        q * b > a, so;
        q;
        too;
        high -  > decrement.For;
        a < 0, r > 0;
        means;
        q * b < a ? Actually : , a < 0, r > 0;
        means;
        a - q * b > 0;
        a > q * b, since;
        a;
        negative, q * b;
        must;
        be;
        more;
        negative;
        than;
        a ? Let : ;
        's not overcomplicate.;
        Better;
        approach: Use;
        integer;
        division;
        via;
        Math.floor;
        for (positive; and; Math.ceil)
            for (negative, but; using; floating)
                division;
        may;
        still;
        be;
        inaccurate.However, we;
        can;
        compute;
        the;
        quotient;
        const integer = __addDisposableResource(env_1, void 0, false), arithmetic = __addDisposableResource(env_1, void 0, false), by = __addDisposableResource(env_1, void 0, false), repeatedly = __addDisposableResource(env_1, void 0, false), subtracting = __addDisposableResource(env_1, void 0, false), That = __addDisposableResource(env_1, void 0, false), would = __addDisposableResource(env_1, void 0, false), be = __addDisposableResource(env_1, void 0, false), too = __addDisposableResource(env_1, void 0, false), slow = __addDisposableResource(env_1, void 0, false), Given = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), numbers = __addDisposableResource(env_1, void 0, false), are = __addDisposableResource(env_1, void 0, false), within = __addDisposableResource(env_1, void 0, false), safe = __addDisposableResource(env_1, void 0, false), integer = __addDisposableResource(env_1, void 0, false), range = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), can = __addDisposableResource(env_1, void 0, false), use = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), fact = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), JavaScript = __addDisposableResource(env_1, void 0, false);
        's bitwise operators convert to 32-bit, not safe. But we can use the approach: q = (a / b) | 0 is not safe.;
        Maybe;
        we;
        can;
        use;
        the;
        built -  in Math.trunc;
        and;
        then;
        adjust, which;
        should;
        be;
        correct;
        for (all; safe; integers)
            because;
        any;
        off - by - one;
        due;
        to;
        floating;
        inaccuracy;
        can;
        be;
        corrected;
        by;
        checking;
        the;
        remainder;
        condition.The;
        only;
        risk;
        is;
        if (the)
            floating;
        division;
        error;
        is;
        more;
        than;
        1, but;
        that;
        's unlikely because the relative error is small and the quotient magnitude is at most 2^53, so error in quotient is at most a few ULPs, but the absolute error in a/b is about (a/b) * 2^-52. For large a/b, the error could be >1? Let';
        s;
        estimate: if (a / b)
            is;
        around;
        10 ^ 15, the;
        ULP;
        at;
        that;
        magnitude;
        is;
        about;
        10 ^ 15 * 2 ^ -52;
        2.22e-4 ? Actually : , 2 ^ -52;
        2.22e-16, multiplied;
        by;
        10 ^ 15;
        gives;
        about;
        0.222.So;
        the;
        error in a / b;
        is;
        about;
        0.222, which;
        is;
        less;
        than;
        1.;
        So;
        the;
        error in the;
        quotient;
        is;
        less;
        than;
        1, so;
        the;
        integer;
        part;
        may;
        be;
        off;
        by;
        at;
        most;
        1.;
        So;
        the;
        adjustment;
        will;
        fix;
        it.If;
        a / b;
        is;
        larger, say;
        up;
        to;
        2 ^ 53;
        9e15, then;
        error;
        could;
        be;
        up;
        to;
        1 ? At : ;
        2 ^ 53, the;
        spacing;
        between;
        representable;
        numbers;
        is;
        1, so;
        the;
        error;
        could;
        be ? Actually : , at;
        2 ^ 53, the;
        ULP;
        is;
        1.;
        So;
        a / b;
        could;
        be;
        off;
        by;
        up;
        to;
        0.5 ? But : ;
        the;
        rounding;
        could;
        cause;
        the;
        double;
        to;
        be;
        off;
        by;
        up;
        to;
        0.5;
        ULP ? Typically : , the;
        error in representing;
        a;
        rational;
        number;
        is;
        at;
        most;
        0.5;
        ULP.So;
        the;
        absolute;
        error in a / b;
        is;
        at;
        most;
        0.5 * ULP.At;
        2 ^ 53, ULP = 1, so;
        error <= 0.5.So;
        the;
        integer;
        part;
        could;
        be;
        off;
        by;
        1;
        only;
        if (the)
            true;
        value;
        is;
        extremely;
        close;
        to;
        an;
        integer;
        and;
        the;
        rounding;
        pushes;
        it;
        across.But;
        with (error <= 0.5, it)
            's possible that the true integer part is k, but the double representation is k+0.4999... and rounding gives k+1? Actually, if the true value is k - epsilon, with epsilon very small, the double might round to k, causing truncation to k instead of k-1. But the error bound is 0.5 ULP, which at large numbers can be up to 0.5. So if the true value is k - 0.000;
    }
    catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
    }
    finally {
        __disposeResources(env_1);
    }
}
