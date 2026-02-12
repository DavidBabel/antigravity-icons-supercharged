import { execSync } from "child_process";
import { join } from "path";

const scripts = [
  "build-json",
  "build-files",
  "build-folders",
  "import-file-types",
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
