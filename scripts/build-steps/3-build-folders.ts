import fs from "node:fs";
import path from "node:path";

const SRC_DIRS = ["vscode-symbols/src/icons/folders", "override/src/folders"];
const DEST_DIR = "build-gray/icons/folders";

const FOLDER_PATHS_D = [
  "M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H13V18H5C4.44772 18 4 17.5523 4 17V7C4 6.44772 4.44772 6 5 6H7.78388C8.01539 6 8.23973 6.08033 8.41862 6.22727L10.8119 8.19318C11.3486 8.63402 12.0216 8.875 12.7161 8.875H19C19.5523 8.875 20 9.32272 20 9.875V10H22V9.875C22 8.21815 20.6569 6.875 19 6.875H12.7161C12.4846 6.875 12.2603 6.79467 12.0814 6.64773L9.6881 4.68182C9.15142 4.24098 8.47841 4 7.78388 4H5Z",
  "M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H14V18H5C4.44772 18 4 17.5523 4 17V7C4 6.44772 4.44772 6 5 6H7.78388C8.01539 6 8.23973 6.08033 8.41862 6.22727L10.8119 8.19318C11.3486 8.63402 12.0216 8.875 12.7161 8.875H19C19.5523 8.875 20 9.32272 20 9.875V10H22V9.875C22 8.21815 20.6569 6.875 19 6.875H12.7161C12.4846 6.875 12.2603 6.79467 12.0814 6.64773L9.6881 4.68182C9.15142 4.24098 8.47841 4 7.78388 4H5Z",
  "M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H10V18H5C4.44772 18 4 17.5523 4 17V7C4 6.44772 4.44772 6 5 6H7.78388C8.01539 6 8.23973 6.08033 8.41862 6.22727L10.8119 8.19318C11.3486 8.63402 12.0216 8.875 12.7161 8.875H19C19.5523 8.875 20 9.32272 20 9.875V10H22V9.875C22 8.21815 20.6569 6.875 19 6.875H12.7161C12.4846 6.875 12.2603 6.79467 12.0814 6.64773L9.6881 4.68182C9.15142 4.24098 8.47841 4 7.78388 4H5Z",
  "M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H12V18H5C4.44772 18 4 17.5523 4 17V7C4 6.44772 4.44772 6 5 6H7.78388C8.01539 6 8.23973 6.08033 8.41862 6.22727L10.8119 8.19318C11.3486 8.63402 12.0216 8.875 12.7161 8.875H19C19.5523 8.875 20 9.32272 20 9.875V10H22V9.875C22 8.21815 20.6569 6.875 19 6.875H12.7161C12.4846 6.875 12.2603 6.79467 12.0814 6.64773L9.6881 4.68182C9.15142 4.24098 8.47841 4 7.78388 4H5Z",
  "M2 7C2 5.34315 3.34315 4 5 4H7.78388C8.47841 4 9.15142 4.24098 9.6881 4.68182L12.0814 6.64773C12.2603 6.79467 12.4846 6.875 12.7161 6.875H19C19.0887 6.875 19.1765 6.87885 19.2633 6.88639V8.91002C19.1794 8.88719 19.0911 8.875 19 8.875H12.7161C12.0216 8.875 11.3486 8.63402 10.8119 8.19318L8.41862 6.22727C8.23973 6.08033 8.01539 6 7.78388 6H5C4.44772 6 4 6.44772 4 7V17C4 17.5523 4.44772 18 5 18H13V20H5C3.34315 20 2 18.6569 2 17V7Z",
  "M7.78418 4C8.4786 4.00007 9.15187 4.24086 9.68848 4.68164L12.0811 6.64746L12.2236 6.74512C12.3729 6.82963 12.5423 6.87495 12.7158 6.875H19C20.6569 6.875 22 8.21815 22 9.875V10H20V9.875C20 9.32272 19.5523 8.875 19 8.875H12.7158C12.1082 8.87494 11.5173 8.69005 11.0195 8.34863L10.8115 8.19336L8.41895 6.22754C8.24013 6.08065 8.01558 6.00007 7.78418 6H5C4.44772 6 4 6.44772 4 7V17C4 17.5523 4.44772 18 5 18H13V20H5C3.34315 20 2 18.6569 2 17V7C2 5.34315 3.34315 4 5 4H7.78418Z",
  "M7.78388 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9.875C21 8.77043 20.1046 7.875 19 7.875H12.7161C12.2531 7.875 11.8044 7.71435 11.4466 7.42045L9.05336 5.45455C8.69558 5.16065 8.2469 5 7.78388 5Z",
];
const CLOSED_FOLDER_PATH_D =
  "M7.78388 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9.875C21 8.77043 20.1046 7.875 19 7.875H12.7161C12.2531 7.875 11.8044 7.71435 11.4466 7.42045L9.05336 5.45455C8.69558 5.16065 8.2469 5 7.78388 5Z";

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const DEST_JSON = "build-gray/symbol-icon-theme.json";

async function processIcons() {
  const generatedClosedIcons: string[] = [];

  // Iterate over files already in the DEST_DIR (collected by build-json or copied previously)
  if (!fs.existsSync(DEST_DIR)) return;

  // Now, in addition to DEST_DIR, we must copy folders from original SRC_DIRS first
  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;
    const files = fs
      .readdirSync(srcDir)
      .filter((file) => file.endsWith(".svg"));
    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(DEST_DIR, file);
      if (!fs.existsSync(destPath)) {
        fs.writeFileSync(destPath, fs.readFileSync(srcPath, "utf8"));
      }
    }
  }

  const files = fs
    .readdirSync(DEST_DIR)
    .filter((file) => file.endsWith(".svg") && !file.endsWith("-closed.svg"));

  for (const file of files) {
    const destPath = path.join(DEST_DIR, file);
    const content = fs.readFileSync(destPath, "utf8");

    // Generate Closed Variant
    // Only if it looks like a folder icon (contains the base folder path definition)
    if (FOLDER_PATHS_D.some((d) => content.includes(d))) {
      const closedName = file.replace(".svg", "-closed.svg");
      const closedContent = generateClosedVariant(content);
      if (closedContent) {
        fs.writeFileSync(path.join(DEST_DIR, closedName), closedContent);
        generatedClosedIcons.push(closedName.replace(".svg", ""));
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

  // Match the folder path using its specific d attribute
  const dVals = FOLDER_PATHS_D.map((d) =>
    d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|");
  const folderPathRegex = new RegExp(
    `<path[^>]*?d="(${dVals})"[^>]*\\/?>`,
    "i",
  );

  // Check if the folder path exists
  const match = cleanSvg.match(folderPathRegex);
  if (!match) {
    console.warn(
      `Could not find standard folder path in SVG: skipping closed variant.`,
    );
    return null;
  }

  const folderPathString = match[0];

  // Extract color dynamically
  let folderColor = "#64748B"; // Default fallback
  const fillMatch = folderPathString.match(/fill="([^"]+)"/i);
  if (fillMatch && fillMatch[1] !== "none") {
    folderColor = fillMatch[1];
  } else {
    const strokeMatch = folderPathString.match(/stroke="([^"]+)"/i);
    if (strokeMatch && strokeMatch[1] !== "none") {
      folderColor = strokeMatch[1];
    }
  }

  // Define closed folder path with extracted color
  const closedFolderPath = `<path d="${CLOSED_FOLDER_PATH_D}" stroke="${folderColor}" stroke-width="2" fill="${folderColor}" mask="url(#decoupe)"/>`;

  // Remove the folder path from the content
  const remainingContent = cleanSvg.replace(folderPathString, "");

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
  let defsMatch = defsRegex.exec(innerContent);
  while (defsMatch !== null) {
    definitions.push(defsMatch[1]);
    defsMatch = defsRegex.exec(innerContent);
  }
  innerContent = innerContent.replace(defsRegex, "");

  // Extract <mask...>...</mask>
  // Note: This matches top-level masks effectively if they are siblings to other elements
  const maskRegex = /<mask[^>]*>([\s\S]*?)<\/mask>/gi;
  let maskMatch = maskRegex.exec(innerContent);
  while (maskMatch !== null) {
    definitions.push(maskMatch[0]);
    maskMatch = maskRegex.exec(innerContent);
  }
  innerContent = innerContent.replace(maskRegex, "");

  // Extract <filter...>...</filter> (if they appear outside defs)
  const filterRegex = /<filter[^>]*>([\s\S]*?)<\/filter>/gi;
  let filterMatch = filterRegex.exec(innerContent);
  while (filterMatch !== null) {
    definitions.push(filterMatch[0]);
    filterMatch = filterRegex.exec(innerContent);
  }
  innerContent = innerContent.replace(filterRegex, "");

  // Prepare Mask Content (Clone of Visual Elements)
  let maskInner = innerContent;

  // Replace fill="<Color>" with fill="black" and add stroke="black" for outlines
  maskInner = maskInner.replace(/fill="([^"]*)"/gi, (match, value) => {
    if (value.toLowerCase() === "none") return match;
    return 'fill="black" stroke="black"';
  });

  // Replace stroke="<Color>" with stroke="black"
  maskInner = maskInner.replace(/stroke="[^"]*"/gi, 'stroke="black"');

  // Clean up duplicated stroke="black" added when an element had both fill and stroke
  maskInner = maskInner.replace(/(stroke="black"\s*){2,}/gi, 'stroke="black" ');

  // Replace stroke-width with 4 to create a wider mask for outlines
  // This ensures a crisp gap without being too thick
  maskInner = maskInner.replace(/stroke-width="[^"]*"/gi, 'stroke-width="4"');

  // Remove style attributes
  maskInner = maskInner.replace(/\sstyle="[^"]*"/gi, "");

  // Remove mask, filter, opacity, clip-path to ensure clean silhouette
  maskInner = maskInner.replace(/\smask="[^"]*"/gi, "");
  maskInner = maskInner.replace(/\sfilter="[^"]*"/gi, "");
  maskInner = maskInner.replace(/\sopacity="[^"]*"/gi, "");
  maskInner = maskInner.replace(/\sclip-path="[^"]*"/gi, "");

  // Inject vector-effect="non-scaling-stroke" to preserve border thickness for scaled icons
  maskInner = maskInner.replace(
    /<(path|rect|circle|ellipse|polygon|polyline)([^>]*)>/gi,
    (match, tag, attrs) => {
      if (!attrs.includes("vector-effect")) {
        return `<${tag} vector-effect="non-scaling-stroke"${attrs}>`;
      }
      return match;
    },
  );

  // Wrap in a group that sets the common mask properties
  // We use stroke-width="2.5" instead of 4 so that filled bodies do not get a massive transparent border
  const maskGroup = `<g stroke="black" stroke-width="2.5">${maskInner}<circle cx="20" cy="16" r="3" fill="black" stroke="none" /></g>`;

  if (innerContent.length === 0 && definitions.length === 0) {
    return `${header}${closedFolderPath.replace('mask="url(#decoupe)"', "")}</svg>`;
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
  return `${header}${maskDef}${closedFolderPath}${innerContent}</svg>`;
}

processIcons().catch(console.error);
