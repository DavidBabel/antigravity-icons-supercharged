import fs from "node:fs";
import path from "node:path";

const SRC_DIRS = ["vscode-symbols/src/icons/folders", "override/src/folders"];
const DEST_DIR = "build/icons/folders";

const FOLDER_COLOR = "#64748B"; // Slate-500
const CLOSED_FOLDER_PATH = `<path d="M7.78388 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9.875C21 8.77043 20.1046 7.875 19 7.875H12.7161C12.2531 7.875 11.8044 7.71435 11.4466 7.42045L9.05336 5.45455C8.69558 5.16065 8.2469 5 7.78388 5Z" stroke="#64748B" stroke-width="2" style="fill: rgb(100, 116, 139);" mask="url(#decoupe)"/>`;

// Ensure destination directory exists and is empty
if (fs.existsSync(DEST_DIR)) {
  fs.rmSync(DEST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DEST_DIR, { recursive: true });

const DEST_JSON = "build/symbol-icon-theme.json";

async function processIcons() {
  const generatedClosedIcons: string[] = [];

  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs
      .readdirSync(srcDir)
      .filter((file) => file.endsWith(".svg"));

    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      const content = fs.readFileSync(srcPath, "utf8");

      // Pass 1: Copy Original
      fs.writeFileSync(path.join(DEST_DIR, file), content);

      // Pass 2: Generate Closed Variant
      // Only if it looks like a folder icon (contains the folder color)
      if (
        content.includes(FOLDER_COLOR) ||
        content.includes("rgb(100, 116, 139)")
      ) {
        const closedName = file.replace(".svg", "-closed.svg");
        const closedContent = generateClosedVariant(content);
        if (closedContent) {
          fs.writeFileSync(path.join(DEST_DIR, closedName), closedContent);
          generatedClosedIcons.push(closedName.replace(".svg", ""));
        }
      }
    }
  }

  if (generatedClosedIcons.length > 0 && fs.existsSync(DEST_JSON)) {
    updateThemeJson(generatedClosedIcons);
  }
}

function updateThemeJson(closedIcons: string[]) {
  const theme = JSON.parse(fs.readFileSync(DEST_JSON, "utf8"));

  // 1. Add iconDefinitions
  for (const icon of closedIcons) {
    theme.iconDefinitions[icon] = {
      iconPath: `./icons/folders/${icon}.svg`,
    };
  }

  // 2. Handle folder names mapping
  if (theme.folderNames) {
    // Rename folderNames to folderNamesExpanded
    theme.folderNamesExpanded = { ...theme.folderNames };

    // Create new folderNames with -closed suffix
    const closedFolderNames: Record<string, string> = {};
    for (const [folderName, iconName] of Object.entries(theme.folderNames)) {
      closedFolderNames[folderName] = `${iconName}-closed`;
    }
    theme.folderNames = closedFolderNames;
  }

  // 3. Update default folder icon
  theme.folder = "folder-closed";

  fs.writeFileSync(DEST_JSON, JSON.stringify(theme, null, 2));
  console.log(
    `\x1b[32m\x1b[1m✅ Successfully updated ${DEST_JSON} with ${closedIcons.length} closed definitions\x1b[0m`,
  );
}

function generateClosedVariant(svgContent: string): string | null {
  // Basic SVG Cleanup
  // Remove newlines to simplify regex
  const cleanSvg = svgContent.replace(/\r?\n|\r/g, " ");

  // Match the folder path
  // We look for a path tag that contains the folder color
  // This regex is a bit greedy but should work for these specific files
  const folderPathRegex =
    /<path[^>]*?(?:fill|stroke)="[^"]*64748B[^"]*"[^>]*\/?>/i;

  // Check if the folder path exists
  const match = cleanSvg.match(folderPathRegex);
  if (!match) {
    // Fallback for rgb color format just in case
    const folderPathRegexRgb =
      /<path[^>]*?(?:fill|stroke)="rgb\(100,\s*116,\s*139\)"[^>]*\/?>/i;
    if (!cleanSvg.match(folderPathRegexRgb)) {
      console.warn(
        `Could not find folder path in SVG (no #64748B): skipping closed variant.`,
      );
      return null;
    }
  }

  // Extract parts
  // 1. Everything before the first path (Header)
  // 2. The Folder Path (To replace)
  // 3. The Other Elements (To keep and use for mask)
  // 4. Closing SVG tag

  // Since we can't reliably parse "Other Elements" with regex if they are complex,
  // we will:
  // 1. Identify valid Folder Path String.
  // 2. Remove it from the full string.
  // 3. Extract the inner content of <svg>...</svg> from what remains.

  // Get the full folder path string found
  const folderPathString = match
    ? match[0]
    : cleanSvg.match(
        /<path[^>]*?(?:fill|stroke)="rgb\(100,\s*116,\s*139\)"[^>]*\/?>/i,
      )![0];

  // Remove the folder path from the content
  let remainingContent = cleanSvg.replace(folderPathString, "");

  // Extract content between <svg ...> and </svg>
  const svgTagRegex = /<svg[^>]*>/;
  const svgCloseRegex = /<\/svg>/;

  const headerMatch = remainingContent.match(svgTagRegex);
  if (!headerMatch) return null;
  const header = headerMatch[0]; // <svg ...>

  // Get the inner content (The "Other Elements")
  let innerContent = remainingContent
    .replace(svgTagRegex, "")
    .replace(svgCloseRegex, "")
    .trim();

  // Prepare Mask Content (Clone of Other Elements)
  // We want to create a silhouette-like mask that cuts out the folder.
  // Logic:
  // 1. If element has fill color -> fill="black"
  // 2. If element has stroke -> stroke="black"
  // 3. Stroke width -> Increased to Create Gap (e.g. 4px)
  // 4. If fill="none" -> keep fill="none" (Important for line icons)

  let maskInner = innerContent;

  // Replace fill="<Color>" with fill="black", but keep fill="none"
  // Using a callback to check the value
  maskInner = maskInner.replace(/fill="([^"]*)"/gi, (match, value) => {
    if (value.toLowerCase() === "none") return match; // Keep fill="none"
    return 'fill="black"';
  });

  // Replace stroke="<Color>" with stroke="black"
  // If stroke="none", we might want to keep it?
  // But usually we want to expand the shape so we probably want stroke="black" even if it was none?
  // Actually if it was fill-only (no stroke), adding a stroke increases the mask size (gap).
  // So yes, usually we want to enforce stroke.
  // However, simply replacing existing strokes is safer for now.
  maskInner = maskInner.replace(/stroke="[^"]*"/gi, 'stroke="black"');

  // Remove stroke-width so it inherits from the group (where we set it to 4)
  maskInner = maskInner.replace(/stroke-width="[^"]*"/gi, "");

  // Remove style attributes just in case
  maskInner = maskInner.replace(/\sstyle="[^"]*"/gi, "");

  // Wrap in a group that sets the common mask properties
  // We set stroke="black" and stroke-width="4" to ensure everything gets the border gap.
  // We do NOT set fill="black" here, allowing the inner elements to control fill (or inherit none).
  const maskGroup = `<g stroke="black" stroke-width="4">${maskInner}</g>`;

  if (innerContent.length === 0) {
    // If there are no other elements (just a plain folder), no mask needed
    // Just return the closed folder shape alone
    return `${header}${CLOSED_FOLDER_PATH.replace('mask="url(#decoupe)"', "")}</svg>`;
  }

  const maskDef = `
    <defs>
        <mask id="decoupe">
            <rect width="100%" height="100%" fill="white" />
            ${maskGroup}
        </mask>
    </defs>`;

  // Reassemble
  return `${header}${maskDef}${CLOSED_FOLDER_PATH}${innerContent}</svg>`;
}

processIcons().catch(console.error);
