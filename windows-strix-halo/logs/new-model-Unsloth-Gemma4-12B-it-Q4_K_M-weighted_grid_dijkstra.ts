const input = fs.readFileSync(0, "utf8");
        const lines = input.split(/\s+/); // Split by any whitespace
         let ptr = 0;
         const H = parseInt(lines[ptr++]);
         const W = parseInt(lines[ptr++]);
         const grid = [];
         for (let i = 0; i < H; i++) {
           grid.push(lines[ptr++]);
         }
