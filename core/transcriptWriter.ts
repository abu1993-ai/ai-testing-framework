import fs from "fs";

export function writeTranscript(results: any[]) {
  const timestamp = Date.now();
  const fileName = `reports/transcript_${timestamp}.txt`;

  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
  }

  let content = "";

  for (const r of results) {
    content += `============================\n`;
    content += `RUN: ${r.run}\n`;
    content += `INTENT: ${r.intent}\n\n`;
    content += `USER:\n${r.userMessage}\n\n`;
    content += `BOT:\n${r.aiReply}\n\n`;
    content += `SCORE: ${r.evaluation.score}\n`;
content += `PASS: ${r.evaluation.pass}\n`;
if (r.failureCategory) {
  content += `CATEGORY: ${r.failureCategory}\n`;
}
content += `REASON: ${r.evaluation.reason}\n\n`;

  }

  fs.appendFileSync(`reports/transcript.txt`, content + "\n\n");
  console.log("Transcript saved:", fileName);
}
