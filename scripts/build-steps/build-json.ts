import fs from "node:fs";
import path from "node:path";

const BASE_JSON = "vscode-symbols/src/symbol-icon-theme.json";
const OVERRIDE_DIR = "override";
const BUILD_DIR = "build-gray";
const DEST_JSON = path.join(BUILD_DIR, "symbol-icon-theme.json");
const DEST_FILES = path.join(BUILD_DIR, "icons", "files");
const DEST_FOLDERS = path.join(BUILD_DIR, "icons", "folders");

async function buildJson() {
  // Ensure build directories exist
  if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true });
  if (!fs.existsSync(DEST_FILES)) fs.mkdirSync(DEST_FILES, { recursive: true });
  if (!fs.existsSync(DEST_FOLDERS))
    fs.mkdirSync(DEST_FOLDERS, { recursive: true });

  // Read base JSON
  if (!fs.existsSync(BASE_JSON)) {
    console.error(`Base JSON not found: ${BASE_JSON}`);
    return;
  }
  const theme = JSON.parse(fs.readFileSync(BASE_JSON, "utf8"));

  // Iterate through override subdirectories
  if (fs.existsSync(OVERRIDE_DIR)) {
    const subdirs = fs.readdirSync(OVERRIDE_DIR).filter((item) => {
      const itemPath = path.join(OVERRIDE_DIR, item);
      // We only care about directories that are not 'src' or '<contribute>'
      return (
        fs.statSync(itemPath).isDirectory() &&
        item !== "src" &&
        item !== "<contribute>"
      );
    });

    for (const subdir of subdirs) {
      const subdirPath = path.join(OVERRIDE_DIR, subdir);
      console.log(
        `\x1b[34m🚀 Processing override:\x1b[0m \x1b[1m${subdir}\x1b[0m`,
      );

      // Handle icons (files/folders)
      const iconsDirs = {
        files: DEST_FILES,
        folders: DEST_FOLDERS,
      };

      for (const [name, dest] of Object.entries(iconsDirs)) {
        const srcPath = path.join(subdirPath, name);
        if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
          const files = fs
            .readdirSync(srcPath)
            .filter((f) => f.endsWith(".svg"));
          for (const file of files) {
            fs.copyFileSync(path.join(srcPath, file), path.join(dest, file));
          }
          console.log(
            `  \x1b[32m📦 Copied ${files.length} SVGs from ${name}/\x1b[0m`,
          );
        }
      }

      // Handle JSON merge
      const jsonFiles = fs
        .readdirSync(subdirPath)
        .filter((f) => f.endsWith(".json"));
      for (const jsonFile of jsonFiles) {
        console.log(`  \x1b[33m🔄 Merging JSON:\x1b[0m ${jsonFile}`);
        const jsonContent = fs.readFileSync(
          path.join(subdirPath, jsonFile),
          "utf8",
        );
        // Strip comments (line and block)
        const cleanJsonContent = jsonContent
          .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "")
          .trim();

        if (!cleanJsonContent) {
          console.log(`  \x1b[90m⏭️  Skipping empty JSON: ${jsonFile}\x1b[0m`);
          continue;
        }

        try {
          const overrideContent = JSON.parse(cleanJsonContent);
          mergeTheme(theme, overrideContent);
        } catch (e) {
          console.error(`Error parsing ${jsonFile}:`, e);
          process.exit(1);
        }
      }
    }
  }

  // Save final JSON
  fs.writeFileSync(DEST_JSON, JSON.stringify(theme, null, 2));
  console.log(`\x1b[32m\x1b[1m✅ Successfully built ${DEST_JSON}\x1b[0m`);
}

function mergeTheme(target: any, source: any) {
  // Skip if source is empty
  if (Object.keys(source).length === 0) {
    return;
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === "object" &&
        target[key] !== null
      ) {
        // Deep merge for nested objects like iconDefinitions, fileNames, etc.
        target[key] = { ...target[key], ...source[key] };
      } else {
        // Overwrite for primitives or arrays
        target[key] = source[key];
      }
    }
  }
}

buildJson().catch((e) => {
  console.error(e);
  process.exit(1);
});
