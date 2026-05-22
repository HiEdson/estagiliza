const fs = require("fs");
const path = require("path");

const logFilePath = "C:\\Users\\edson\\.gemini\\antigravity\\brain\\51bac91f-bea5-4d09-aa9f-40abe3c068ba\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logFilePath)) {
  console.log("Log file does not exist.");
  process.exit(0);
}

const content = fs.readFileSync(logFilePath, "utf8");
const lines = content.split("\n");

// Look for USER_INPUT or search-jobs or searchJobs in recent lines
let count = 0;
for (let i = lines.length - 1; i >= 0; i--) {
  const line = lines[i];
  if (!line) continue;
  try {
    const parsed = JSON.parse(line);
    // Find model tool calls or user messages that contain profile details
    if (JSON.stringify(parsed).includes("search-jobs") || JSON.stringify(parsed).includes("profile")) {
      console.log(`--- STEP ${parsed.step_index} (${parsed.type}) ---`);
      // Print first 1000 characters of parsed object
      const str = JSON.stringify(parsed, null, 2);
      console.log(str.length > 2000 ? str.slice(0, 2000) + "\n... [TRUNCATED]" : str);
      count++;
      if (count >= 5) break;
    }
  } catch (err) {
    // Ignore invalid JSON lines
  }
}
