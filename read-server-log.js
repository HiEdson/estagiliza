const fs = require("fs");
const path = require("path");

const logFilePath = "C:\\Users\\edson\\.gemini\\antigravity\\brain\\51bac91f-bea5-4d09-aa9f-40abe3c068ba\\.system_generated\\tasks\\task-413.log";

if (!fs.existsSync(logFilePath)) {
  console.log("Log file does not exist.");
  process.exit(0);
}

const content = fs.readFileSync(logFilePath, "utf8");
console.log("--- SERVER LOG LAST 1500 CHARACTERS ---");
console.log(content.slice(-1500));
console.log("---------------------------------------");
