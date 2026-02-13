import * as fs from "fs";
import * as path from "path";

const SRC_DIR = "build-gray";
const DEST_DIR = "build-blue";

// Blue color to replace gray with
const BLUE_COLOR = "#42a5f5";
const GRAY_RGB = "rgb(100, 116, 139)";
const GRAY_HEX = "#64748B";

console.log(`\n🔵 Generating Blue Variant in ${DEST_DIR}...`);

// 1. Copy build to build-blue
if (fs.existsSync(DEST_DIR)) {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
}

// Copy recursively
console.log(`  📦 Copying ${SRC_DIR} to ${DEST_DIR}...`);
fs.cpSync(SRC_DIR, DEST_DIR, { recursive: true });

// Cleanup icon-blue.png from build-gray (source)
const iconBlueInGray = path.join(SRC_DIR, "images/icon-blue.png");
if (fs.existsSync(iconBlueInGray)) {
  fs.unlinkSync(iconBlueInGray);
  console.log(`  🧹 Removed ${iconBlueInGray} (cleanup source)`);
}

// Cleanup icon-gray.png from build-blue (destination) BEFORE renaming
// This prevents renaming icon-gray.png -> icon-blue.png which would overwrite the correct blue icon
const iconGrayInBlue = path.join(DEST_DIR, "images/icon-gray.png");
if (fs.existsSync(iconGrayInBlue)) {
  fs.unlinkSync(iconGrayInBlue);
  console.log(`  🧹 Removed ${iconGrayInBlue} (cleanup destination)`);
}

// 2. Walk and replace content (colors and text)
let processedFiles = 0;
let replacedCount = 0;

function processDirectory(directory: string) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      // We only care about text files
      const ext = path.extname(file).toLowerCase();
      if (
        [
          ".svg",
          ".json",
          ".xml",
          ".txt",
          ".md",
          ".html",
          ".css",
          ".js",
          ".ts",
        ].includes(ext)
      ) {
        let content = fs.readFileSync(fullPath, "utf8");
        let fileChanged = false;

        // Replace RGB format
        if (content.includes(GRAY_RGB)) {
          content = content.replaceAll(GRAY_RGB, BLUE_COLOR);
          fileChanged = true;
        }

        // Replace HEX format (case insensitive check)
        const hexRegex = new RegExp(GRAY_HEX, "gi");
        if (hexRegex.test(content)) {
          content = content.replace(hexRegex, BLUE_COLOR);
          fileChanged = true;
        }

        // Replace "gray" with "blue"
        if (content.includes("gray")) {
          content = content.replaceAll("gray", "blue");
          fileChanged = true;
        }
        if (content.includes("Gray")) {
          content = content.replaceAll("Gray", "Blue");
          fileChanged = true;
        }

        if (fileChanged) {
          fs.writeFileSync(fullPath, content);
          replacedCount++;
        }
        processedFiles++;
      }
    }
  }
}

console.log(`  🎨 Applying blue color and text transformation...`);
processDirectory(DEST_DIR);

// 3. Rename files and folders
function renameFilesAndFolders(directory: string) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip icons/folders from renaming
      if (fullPath.includes("icons/folders")) {
        continue;
      }

      renameFilesAndFolders(fullPath);
      // Rename directory if needed, after processing children
      if (file.includes("gray")) {
        const newName = file.replace("gray", "blue");
        const newPath = path.join(directory, newName);
        // Only rename if target doesn't exist (prevent overwriting existing blue variants)
        if (!fs.existsSync(newPath)) {
          fs.renameSync(fullPath, newPath);
        }
      } else if (file.toLowerCase().includes("gray")) {
        // Handle case insensitive if needed, but sticking to explicit for now
        // logic above handles exact "gray" match which is safest
      }
    } else {
      if (file.includes("gray")) {
        const newName = file.replace("gray", "blue");
        const newPath = path.join(directory, newName);
        // Only rename if target doesn't exist (prevent overwriting existing blue variants)
        if (!fs.existsSync(newPath)) {
          fs.renameSync(fullPath, newPath);
        }
      }
    }
  }
}

console.log(`  🏷️  Renaming files and folders...`);
renameFilesAndFolders(DEST_DIR);

// 4. Replace [PROMO_COLORS] in READMEs
const PROMO_TEXT =
  "There is two versions of the theme, a **blue one** and a **gray one** check what is your favorite.";
const PLACEHOLDER = "[PROMO_COLORS]";
const README_FILES = [
  path.join(SRC_DIR, "README.md"),
  path.join(DEST_DIR, "README.md"),
];

console.log(`  📝 Updating README promo text...`);
for (const readmePath of README_FILES) {
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, "utf8");
    if (content.includes(PLACEHOLDER)) {
      content = content.replace(PLACEHOLDER, PROMO_TEXT);
      fs.writeFileSync(readmePath, content);
      console.log(`    ✅ Updated ${readmePath}`);
    } else {
      console.log(`    ⚠️ Placeholder not found in ${readmePath}`);
    }
  } else {
    console.log(`    ⚠️ ${readmePath} not found`);
  }
}

console.log(
  `✅ Blue variant generated! Processed ${processedFiles} files, modified ${replacedCount} files.\n`,
);
