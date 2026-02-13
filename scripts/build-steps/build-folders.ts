import fs from "node:fs";
import path from "node:path";

const SRC_DIRS = ["vscode-symbols/src/icons/folders", "override/src/folders"];
const DEST_DIR = "build-gray/icons/folders";

const FOLDER_COLOR = "#64748B"; // Slate-500
const CLOSED_FOLDER_PATH = `<path d="M7.78388 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9.875C21 8.77043 20.1046 7.875 19 7.875H12.7161C12.2531 7.875 11.8044 7.71435 11.4466 7.42045L9.05336 5.45455C8.69558 5.16065 8.2469 5 7.78388 5Z" stroke="#64748B" stroke-width="2" style="fill: rgb(100, 116, 139);" mask="url(#decoupe)"/>`;

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const DEST_JSON = "build-gray/symbol-icon-theme.json";

async function processIcons() {
  const generatedClosedIcons: string[] = [];

  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;

    const files = fs
      .readdirSync(srcDir)
      .filter((file) => file.endsWith(".svg"));

    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(DEST_DIR, file);

      // If file already exists (e.g. copied by build-json from overrides), don't overwrite it
      if (fs.existsSync(destPath)) continue;

      const content = fs.readFileSync(srcPath, "utf8");

      // Pass 1: Copy Original
      fs.writeFileSync(destPath, content);

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
  theme.folderExpanded = "folder";

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

  // Extract Definitions (<defs> and <mask>) to avoid duplication
  const definitions: string[] = [];

  // Extract <defs>...</defs>
  const defsRegex = /<defs>([\s\S]*?)<\/defs>/gi;
  let defsMatch;
  while ((defsMatch = defsRegex.exec(innerContent)) !== null) {
    definitions.push(defsMatch[1]);
  }
  innerContent = innerContent.replace(defsRegex, "");

  // Extract <mask...>...</mask>
  // Note: This matches top-level masks effectively if they are siblings to other elements
  const maskRegex = /<mask[^>]*>([\s\S]*?)<\/mask>/gi;
  let maskMatch;
  while ((maskMatch = maskRegex.exec(innerContent)) !== null) {
    definitions.push(maskMatch[0]);
  }
  innerContent = innerContent.replace(maskRegex, "");

  // Extract <filter...>...</filter> (if they appear outside defs)
  const filterRegex = /<filter[^>]*>([\s\S]*?)<\/filter>/gi;
  let filterMatch;
  while ((filterMatch = filterRegex.exec(innerContent)) !== null) {
    definitions.push(filterMatch[0]);
  }
  innerContent = innerContent.replace(filterRegex, "");

  // Prepare Mask Content (Clone of Visual Elements)
  let maskInner = innerContent;

  // Replace fill="<Color>" with fill="black", but keep fill="none"
  maskInner = maskInner.replace(/fill="([^"]*)"/gi, (match, value) => {
    if (value.toLowerCase() === "none") return match;
    return 'fill="black"';
  });

  // Replace stroke="<Color>" with stroke="black"
  maskInner = maskInner.replace(/stroke="[^"]*"/gi, 'stroke="black"');

  // Replace stroke-width with 6 to create a wider mask for outlines
  // This ensures the gap is consistent (~2px) for both filled (inheriting 4) and outline icons
  maskInner = maskInner.replace(/stroke-width="[^"]*"/gi, 'stroke-width="6"');

  // Remove style attributes
  maskInner = maskInner.replace(/\sstyle="[^"]*"/gi, "");

  // Remove mask, filter, opacity, clip-path to ensure clean silhouette
  maskInner = maskInner.replace(/\smask="[^"]*"/gi, "");
  maskInner = maskInner.replace(/\sfilter="[^"]*"/gi, "");
  maskInner = maskInner.replace(/\sopacity="[^"]*"/gi, "");
  maskInner = maskInner.replace(/\sclip-path="[^"]*"/gi, "");

  // Wrap in a group that sets the common mask properties
  // We add a central circle to ensure the middle is cut out (good for outline icons)
  // User requested "3 par 3" (radius 3) at bottom right (approx 20, 16 based on other icons)
  const maskGroup = `<g stroke="black" stroke-width="4">${maskInner}<circle cx="20" cy="16" r="3" fill="black" stroke="none" /></g>`;

  if (innerContent.length === 0 && definitions.length === 0) {
    return `${header}${CLOSED_FOLDER_PATH.replace('mask="url(#decoupe)"', "")}</svg>`;
  }

  // Combine definitions
  const allDefs = definitions.join("");

  const maskDef = `
    <defs>
        ${allDefs}
        <mask id="decoupe">
            <rect width="100%" height="100%" fill="white" />
            ${maskGroup}
        </mask>
    </defs>`;

  // Reassemble: Header + Definitions/Masks + Folder Path + Visual Content
  // Note: We put allDefs inside the main defs block with the coupe mask
  return `${header}${maskDef}${CLOSED_FOLDER_PATH}${innerContent}</svg>`;
}

processIcons().catch(console.error);
