import fs from "fs";

export function writeReport(results: any[]) {
  const timestamp = Date.now();
  const fileName = `reports/report_${timestamp}.json`;

  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
  }

  fs.writeFileSync(fileName, JSON.stringify(results, null, 2));

  console.log("Report saved:", fileName);
}
