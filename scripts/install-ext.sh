#!/bin/bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
PUBLISHER="davidbabel"
EXT_BASE_GRAY="antigravity-icons-supercharged-gray"
EXT_BASE_BLUE="antigravity-icons-supercharged-blue"
EXTENSIONS_DIR="$HOME/.antigravity-server/extensions"
EXTENSIONS_JSON="$EXTENSIONS_DIR/extensions.json"
OUTPUT_DIR="build"

# Read version from package.json
VERSION=$(python3 -c "import json; print(json.load(open('package.json'))['version'])")

# ─── Helpers ─────────────────────────────────────────────────────────────────

install_extension() {
  local ext_base="$1"
  local vsix_file="$OUTPUT_DIR/${ext_base}-${VERSION}.vsix"
  local ext_id="${PUBLISHER}.${ext_base}"
  local ext_dir_name="${ext_id}-${VERSION}"
  local ext_dir="$EXTENSIONS_DIR/$ext_dir_name"

  if [ ! -f "$vsix_file" ]; then
    echo "⚠️  VSIX not found: $vsix_file"
    return 1
  fi

  # 1. Remove any previous version of this extension
  local old_dirs
  old_dirs=$(find "$EXTENSIONS_DIR" -maxdepth 1 -type d -name "${ext_id}-*" 2>/dev/null || true)
  if [ -n "$old_dirs" ]; then
    echo "  🗑️  Removing previous version(s)..."
    echo "$old_dirs" | while read -r d; do
      rm -rf "$d"
    done
  fi

  # 2. Extract the VSIX (it's a ZIP) into a temp directory
  local tmp_dir
  tmp_dir=$(mktemp -d)
  trap "rm -rf '$tmp_dir'" RETURN

  unzip -q "$vsix_file" -d "$tmp_dir"

  # 3. Copy the extension/ subfolder to the target directory
  mkdir -p "$ext_dir"
  cp -r "$tmp_dir/extension/"* "$ext_dir/"

  echo "  ✅ Installed to $ext_dir_name"

  # 4. Update extensions.json — remove old entry, add new one
  local timestamp
  timestamp=$(date +%s)000  # ms timestamp

  # Remove existing entry for this extension id
  python3 -c "
import json, sys

json_path = '$EXTENSIONS_JSON'
ext_id = '$ext_id'
ext_dir_name = '$ext_dir_name'
ext_dir = '$ext_dir'
version = '$VERSION'
timestamp = $timestamp

try:
    with open(json_path, 'r') as f:
        data = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    data = []

# Remove any existing entries for this extension
data = [e for e in data if e.get('identifier', {}).get('id') != ext_id]

# Add new entry
data.append({
    'identifier': {'id': ext_id},
    'version': version,
    'location': {
        '\$mid': 1,
        'path': ext_dir,
        'scheme': 'file'
    },
    'relativeLocation': ext_dir_name,
    'metadata': {
        'installedTimestamp': timestamp,
        'pinned': False,
        'source': 'vsix',
        'targetPlatform': 'undefined',
        'updated': True,
        'private': False,
        'isPreReleaseVersion': False,
        'hasPreReleaseVersion': False,
        'isApplicationScoped': False,
        'isMachineScoped': False,
        'isBuiltin': False,
        'preRelease': False
    }
})

with open(json_path, 'w') as f:
    json.dump(data, f, indent=2)
"
}

# ─── Main ────────────────────────────────────────────────────────────────────

if [ ! -d "$OUTPUT_DIR" ]; then
  echo "❌ Error: $OUTPUT_DIR directory not found! Run 'bun run package' first."
  exit 1
fi

echo "📦 Installing extensions (v${VERSION}) to AntiGravity IDE..."
echo ""

echo "🔘 Gray variant:"
install_extension "$EXT_BASE_GRAY"

echo "🔵 Blue variant:"
install_extension "$EXT_BASE_BLUE"

echo ""
echo "✅ Extensions installed successfully!"
echo "🔄 Reload the IDE window to apply: Ctrl+Shift+P → 'Developer: Reload Window'"
