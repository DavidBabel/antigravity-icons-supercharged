import fs from "node:fs";
import path from "node:path";

const SRC_DIR = "vscode-symbols/file-types";
const DEST_DIR = "file-types";

async function importFileTypes() {
  if (!fs.existsSync(SRC_DIR)) {
    console.warn(`Source directory not found: ${SRC_DIR}`);
    return;
  }

  // Ensure destination directory exists
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SRC_DIR);
  let copiedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const destPath = path.join(DEST_DIR, file);

    // Only copy if it doesn't exist in destination
    if (!fs.existsSync(destPath)) {
      // Check if it's a file before copying
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
        copiedCount++;
        // console.log(`Copied: ${file}`); // Optional: verification log
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`\x1b[34mℹ️  File Types Import:\x1b[0m`);
  console.log(`  \x1b[32m✅ Imported: ${copiedCount}\x1b[0m`);
  console.log(`  \x1b[90m⏭️  Skipped (already exists): ${skippedCount}\x1b[0m`);
}

importFileTypes().catch(console.error);
