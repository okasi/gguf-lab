const fs = require("fs");
const ts = require("./node_modules/typescript");

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error("usage: node transpile-ts.js input.ts output.js");
  process.exit(2);
}

const source = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
const result = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
    skipLibCheck: true,
  },
  reportDiagnostics: true,
});

if (result.diagnostics && result.diagnostics.length) {
  for (const diagnostic of result.diagnostics) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.error(message);
  }
}

fs.writeFileSync(outputPath, result.outputText, "utf8");
