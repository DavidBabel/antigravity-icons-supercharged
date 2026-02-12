import fs from "node:fs";
import path from "node:path";

const SRC_DIRS = ["vscode-symbols/src/icons/files", "override/src/files"];
const DEST_DIR = "build/icons/files";

// Ensure destination directory exists and is empty
if (fs.existsSync(DEST_DIR)) {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DEST_DIR, { recursive: true });

async function processIcons() {
  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs
      .readdirSync(srcDir)
      .filter((file) => file.endsWith(".svg"));

    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      const content = fs.readFileSync(srcPath, "utf8");

      // For now, just copy the original
      fs.writeFileSync(path.join(DEST_DIR, file), content);
    }
    console.log(
      `  \x1b[32m📦 Processed ${files.length} icons from ${srcDir}\x1b[0m`,
    );
  }
}

processIcons().catch(console.error);
