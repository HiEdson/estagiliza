const fs = require("fs");
const path = require("path");
const readline = require("readline");

const logFilePath = "C:\\Users\\edson\\.gemini\\antigravity\\brain\\51bac91f-bea5-4d09-aa9f-40abe3c068ba\\.system_generated\\logs\\transcript.jsonl";

if (!fs.existsSync(logFilePath)) {
  console.log("Log file does not exist at:", logFilePath);
  process.exit(0);
}

const fileStream = fs.createReadStream(logFilePath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let searchCount = 0;
rl.on("line", (line) => {
  if (line.includes("search-jobs") || line.includes("searchJobs") || line.includes("profile")) {
    // Only print a snippet
    if (line.length > 500) {
      console.log(`Line ${line.slice(0, 300)}... [truncated]`);
    } else {
      console.log(line);
    }
    searchCount++;
    if (searchCount > 30) {
      rl.close();
      process.exit(0);
    }
  }
});
