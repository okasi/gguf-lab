"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const data = fs.readFileSync(0, 'utf8').trim();
const lines = data.split(/\r?\n/);
if (lines.length === 0) {
    // should not happen
    process.stdout.write('EMPTY\nEMPTY\n');
    process.exit(0);
}
const [C_str, N_str] = lines[0].split(' ');
const capacity = parseInt(C_str, 10);
const N = parseInt(N_str, 10);
const cache = new Map();
const getResults = [];
for (let i = 1; i <= N; i++) {
    const line = lines[i];
    if (!line)
        continue; // skip empty lines if any
    const parts = line.split(' ');
    const op = parts[0];
    if (op === 'PUT') {
        const key = parts[1];
        const value = parseInt(parts[2], 10);
        if (cache.has(key)) {
            // update and move to end
            cache.set(key, value);
        }
        else {
            if (cache.size === capacity) {
                // evict least recently used: first key in iteration
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }
            cache.set(key, value);
        }
    }
    else if (op === 'GET') {
        const key = parts[1];
        const val = cache.get(key);
        if (val !== undefined) {
            getResults.push(val);
            // move to end
            cache.set(key, val);
        }
        else {
            getResults.push(-1);
        }
    }
    else if (op === 'DEL') {
        const key = parts[1];
        cache.delete(key);
    }
}
if (getResults.length === 0) {
    process.stdout.write('EMPTY\n');
}
else {
    process.stdout.write(getResults.join(' ') + '\n');
}
if (cache.size === 0) {
    process.stdout.write('EMPTY\n');
}
else {
    // keys from most-recently-used to least-recently-used
    const keys = Array.from(cache.keys());
    keys.reverse();
    process.stdout.write(keys.join(' ') + '\n');
}
