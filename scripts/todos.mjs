// Lists every "TODO:" left in content/profile.ts (they are never rendered).
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../content/profile.ts", import.meta.url), "utf8");
const todos = [...src.matchAll(/["'`]TODO:\s*([^"'`]+)["'`]/g)].map((m) => {
  const line = src.slice(0, m.index).split("\n").length;
  return `  line ${String(line).padStart(4)}  ${m[1].trim()}`;
});
console.log(todos.length ? `${todos.length} TODOs in content/profile.ts:\n${todos.join("\n")}` : "No TODOs left.");
