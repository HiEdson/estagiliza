const fs = require("fs");
const path = require("path");

const logFilePath = "C:\\Users\\edson\\.gemini\\antigravity\\brain\\51bac91f-bea5-4d09-aa9f-40abe3c068ba\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logFilePath)) {
  console.log("Log file does not exist.");
  process.exit(0);
}

const lines = fs.readFileSync(logFilePath, "utf8").split("\n");
for (const line of lines) {
  if (!line) continue;
  const parsed = JSON.parse(line);
  if (parsed.step_index === 198 || parsed.step_index === 197 || parsed.step_index === 184) {
    console.log("--- STEP", parsed.step_index, "---");
    console.log(JSON.stringify(parsed, null, 2));
  }
}
