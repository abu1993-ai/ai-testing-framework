import fs from "fs";
import path from "path";

const FILE = path.join(__dirname, "..", "summary.json");

function load() {
  if (!fs.existsSync(FILE)) {
    return { total: 0, success: 0, failures: {} as Record<string, number> };
  }
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data: any) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function recordResult(state: any) {
  const data = load();

  data.total++;

  if (state.completed) {
    data.success++;
  } else {
    const type = state.failureType || "UNKNOWN";
    data.failures[type] = (data.failures[type] || 0) + 1;
  }

  save(data);
}

export function printSummary() {
  const data = load();

  console.log("\n================ TEST SUMMARY ================");
  console.log("Total:", data.total);
  console.log("Success:", data.success);
  console.log("Failures:", data.failures);
  console.log("=============================================\n");
}

export function exportCSV() {
  const data = load();

  const lines = [
    "total,success,failure_type,count"
  ];

  lines.push(`${data.total},${data.success},,`);

  for (const [type, count] of Object.entries(data.failures)) {
    lines.push(`,,${type},${count}`);
  }

  const fs = require("fs");
  fs.writeFileSync("summary.csv", lines.join("\n"));
}