import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

// Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
  gray: "\x1b[90m",
};

const emojis = {
  folder: "📁",
  file: "📄",
  sparkles: "✨",
  check: "✅",
  cross: "❌",
  rocket: "🚀",
  question: "❓",
};

async function main() {
  console.log(
    `\n${colors.cyan}${colors.bold}${emojis.rocket}  Welcome to Antigravity Icons Contributor Script!${colors.reset}\n`,
  );

  const rootDir = process.cwd();
  const overrideDir = path.join(rootDir, "override");
  let folderName = "";
  let targetDir = "";

  while (true) {
    const folderNameStr = await ask(
      `${colors.yellow}${emojis.question}  Enter the name of the folder to create (default: contrib): ${colors.reset}`,
    );
    folderName = folderNameStr.trim() || "contrib";
    targetDir = path.join(overrideDir, folderName);

    if (fs.existsSync(targetDir)) {
      console.log(
        `${colors.red}${emojis.cross}  Directory ${folderName} already exists in override/! Please choose another name.${colors.reset}`,
      );
      continue;
    }
    break;
  }

  console.log(`\n${colors.blue}What would you like to do?${colors.reset}`);

  console.log(`${colors.yellow}# Associate existing icons${colors.reset}`);
  console.log(`1. Associate existing ${colors.bold}files${colors.reset} icons`);
  console.log(
    `2. Associate existing ${colors.bold}folders${colors.reset} icons`,
  );
  console.log(
    `3. Associate both - ${colors.bold}files${colors.reset} and ${colors.bold}folders${colors.reset}`,
  );

  console.log(`${colors.green}# Add new icons${colors.reset}`);
  console.log(`4. Add new ${colors.bold}files${colors.reset} icons`);
  console.log(`5. Add new ${colors.bold}folders${colors.reset} icons`);
  console.log(
    `6. Create both - new ${colors.bold}files${colors.reset} and ${colors.bold}folders${colors.reset}`,
  );

  console.log(`${colors.gray}# Other${colors.reset}`);
  console.log(`7. I don't know`);

  const choiceStr = await ask(
    `\n${colors.cyan}Select an option (1-7) [default: 7]: ${colors.reset}`,
  );

  rl.close();

  const choiceNum =
    choiceStr.trim() === "" ? 7 : parseInt(choiceStr.trim(), 10);

  if (Number.isNaN(choiceNum) || choiceNum < 1 || choiceNum > 7) {
    process.exit(1);
  }

  const templateDir = path.join(overrideDir, "<contribute>");

  // Copy
  console.log(`\n${colors.blue}Creating directory...${colors.reset}`);
  try {
    fs.cpSync(templateDir, targetDir, { recursive: true });
  } catch (e) {
    console.error(`${colors.red}Failed to copy directory: ${e}${colors.reset}`);
    process.exit(1);
  }

  // Rename json
  const oldJson = path.join(targetDir, "<contribute>.json");
  const newJson = path.join(targetDir, `${folderName}.json`);

  if (fs.existsSync(oldJson)) {
    fs.renameSync(oldJson, newJson);
  }

  // Paths to potential deletions
  const filesDir = path.join(targetDir, "files");
  const foldersDir = path.join(targetDir, "folders");
  const sampleFile = path.join(targetDir, "<test_file_with_your_icon>.<ext>");
  const sampleFolder = path.join(targetDir, "<test_folder_with_your_icon>");

  // Logic mapping
  const finalChoice = choiceNum === 7 ? 6 : choiceNum;

  // Cleanup helper
  const remove = (p: string) => {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  };

  switch (finalChoice) {
    case 1: // Files (existing)
      console.log(
        `${colors.yellow}Setting up for existing file icon association...${colors.reset}`,
      );
      remove(foldersDir);
      remove(filesDir);
      remove(sampleFolder);
      // Keep sampleFile
      break;
    case 2: // Folders (existing)
      console.log(
        `${colors.yellow}Setting up for existing folder icon association...${colors.reset}`,
      );
      remove(foldersDir);
      remove(filesDir);
      // Keep sampleFolder
      remove(sampleFile);
      break;
    case 3: // Both (existing)
      console.log(
        `${colors.yellow}Setting up for existing icon associations...${colors.reset}`,
      );
      remove(foldersDir);
      remove(filesDir);
      remove(sampleFolder);
      remove(sampleFile);
      break;
    case 4: // Files (add new)
      console.log(
        `${colors.yellow}Setting up for new file icons...${colors.reset}`,
      );
      remove(foldersDir);
      remove(sampleFolder);
      break;
    case 5: // Folders (add new)
      console.log(
        `${colors.yellow}Setting up for new folder icons...${colors.reset}`,
      );
      remove(filesDir);
      remove(sampleFile);
      break;
    case 6: // Both (add new)
      console.log(`${colors.yellow}Setting up for new icons...${colors.reset}`);
      // Keep everything
      break;
  }

  console.log(
    `\n${colors.green}${colors.bold}${emojis.check}  Done! Created ${folderName} in override/.${colors.reset}`,
  );
  console.log(
    `${colors.green}  Please check ${newJson} in the override/${folderName} directory to configure your icons.${colors.reset}\n`,
  );

  // Open the new json in Editor
  try {
    console.log(`${colors.blue}Opening file in editor...${colors.reset}`);
    try {
      execSync(`antigravity "${newJson}"`, { stdio: "inherit" });
    } catch {
      execSync(`code "${newJson}"`, { stdio: "inherit" });
    }
  } catch {
    // If both 'antigravity' and 'code' commands fail, ignore silently
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
