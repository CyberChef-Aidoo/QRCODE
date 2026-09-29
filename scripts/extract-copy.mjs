import fs from "node:fs";

const path =
  "C:/Users/USER/.cursor/projects/c-Users-USER-Downloads-QRCODE/agent-transcripts/61dcb199-15c5-4983-9a9a-9946dadc4b81/61dcb199-15c5-4983-9a9a-9946dadc4b81.jsonl";
const lines = fs.readFileSync(path, "utf8").split(/\n/);
const line = lines[104];
const i = line.indexOf("heroHeading");
console.log(line.slice(i, i + 2500));
