import { execSync } from "node:child_process";
import { join } from "node:path";

const scripts = [
  "1-build-json",
  "2-build-files",
  "3-build-folders",
  "4-import-file-types",
  "5-build-copy-files",
  "6-build-blue",
];

scripts.forEach((script) => {
  console.log(`Running ${script}...`);
  try {
    execSync(`bun ${join(__dirname, "build-steps", `${script}.ts`)}`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`Error running ${script}:`, error);
    process.exit(1);
  }
});
