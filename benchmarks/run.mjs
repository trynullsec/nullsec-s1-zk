import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const sets = [
  { vulnerable: "examples/vulnerable", safe: "examples/safe" },
  { vulnerable: "examples/halo2/vulnerable", safe: "examples/halo2/safe" }
];

function filesIn(dir) {
  return readdirSync(join(root, dir))
    .filter((file) => file.endsWith(".circom") || file.endsWith(".rs"))
    .map((file) => join(dir, file));
}

function scan(file) {
  try {
    return JSON.parse(execFileSync("node", ["dist/cli.js", "scan", file, "--format", "json"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  } catch (error) {
    const stdout = error.stdout?.toString() ?? "";
    if (stdout.trim()) return JSON.parse(stdout);
    throw error;
  }
}

function hasHighOrCritical(result) {
  return result.issues.some((issue) => issue.severity === "CRITICAL" || issue.severity === "HIGH");
}

let vuln = 0;
let safe = 0;
let TP = 0;
let FN = 0;
let TN = 0;
let FP = 0;
const missed = [];
const falsePositives = [];

for (const set of sets) {
  for (const file of filesIn(set.vulnerable)) {
    vuln += 1;
    if (hasHighOrCritical(scan(file))) TP += 1;
    else {
      FN += 1;
      missed.push(file);
    }
  }
  for (const file of filesIn(set.safe)) {
    safe += 1;
    if (hasHighOrCritical(scan(file))) {
      FP += 1;
      falsePositives.push(file);
    } else {
      TN += 1;
    }
  }
}

const pct = (numerator, denominator) => (denominator === 0 ? "0.00" : ((numerator / denominator) * 100).toFixed(2));
const precision = pct(TP, TP + FP);
const recall = pct(TP, TP + FN);
const falseSafeRate = pct(FN, vuln);
const falsePositiveRate = pct(FP, safe);

console.log(`vuln=${vuln} safe=${safe} TP=${TP} FN=${FN} TN=${TN} FP=${FP}`);
console.log(`precision=${precision}% recall=${recall}% false_safe_rate=${falseSafeRate}% false_positive_rate=${falsePositiveRate}%`);
for (const file of missed) console.log(`MISSED: ${file}`);
for (const file of falsePositives) console.log(`FALSE POSITIVE: ${file}`);

if (FP > 0) process.exit(1);
