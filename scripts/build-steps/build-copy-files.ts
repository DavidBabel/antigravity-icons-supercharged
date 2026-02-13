import * as fs from "fs";
import * as path from "path";

const SRC_FILE = "scripts/build-files-list";
const DEST_DIRS = ["build-gray"];

console.log("\n📂 Copying shared files...");

if (!fs.existsSync(SRC_FILE)) {
  console.error(`❌ Source file list not found: ${SRC_FILE}`);
  process.exit(1);
}

const fileList = fs
  .readFileSync(SRC_FILE, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith("#"));

let copiedCount = 0;

for (const destDir of DEST_DIRS) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const filePath of fileList) {
    // Resolve source path relative to project root
    const srcPath = filePath;
    const fileName = path.basename(filePath);

    // Handle subdirectories in source (e.g. images/icon.png)
    // We want to preserve structure if it's in a subdirectory?
    // Or flatten?
    // VS Code extensions usually expect README etc at root.
    // images/icon.png should probably stay in images/ folder in build.

    const targetPath = path.join(destDir, filePath);
    const targetDir = path.dirname(targetPath);

    if (fs.existsSync(srcPath)) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.copyFileSync(srcPath, targetPath);
      copiedCount++;
    } else {
      console.warn(`⚠️  File not found: ${srcPath}`);
    }
  }
}

console.log(
  `✅ Copied ${copiedCount / DEST_DIRS.length} files to both build directories.\n`,
);
