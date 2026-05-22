const fs = require("fs");
const path = require("path");

const logFilePath = "C:\\Users\\edson\\.gemini\\antigravity\\brain\\51bac91f-bea5-4d09-aa9f-40abe3c068ba\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logFilePath)) {
  console.log("Log file does not exist.");
  process.exit(0);
}

const content = fs.readFileSync(logFilePath, "utf8");
const lines = content.split("\n");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;
  try {
    const parsed = JSON.parse(line);
    // Let's find where a CV parsing result profile is returned
    if (parsed.type === "CODE_ACTION" || parsed.type === "PLANNER_RESPONSE" || parsed.type === "USER_INPUT") {
      const str = JSON.stringify(parsed);
      if (str.includes("profile") && str.includes("skills") && str.includes("experience")) {
        console.log(`--- STEP ${parsed.step_index} (${parsed.type}) ---`);
        // Extract the profile structure if it's there
        const match = str.match(/\{[^{}]*"name"[^{}]*"area"[^{}]*\}/);
        if (match) {
          console.log(match[0]);
        } else {
          console.log(str.slice(0, 500) + "...");
        }
      }
    }
  } catch (err) {
  }
}
 