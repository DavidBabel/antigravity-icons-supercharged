#!/bin/bash

# Uninstall existing extensions if they exist
echo "🗑️  Uninstalling existing Antigravity Icons extensions..."
antigravity --uninstall-extension davidbabel.antigravity-icons-supercharged-gray --force || true
antigravity --uninstall-extension davidbabel.antigravity-icons-supercharged-blue --force || true

sleep 2

# Find the newly built VSIX files and install them
OUTPUT_DIR="build"

if [ -d "$OUTPUT_DIR" ]; then
  GRAY_VSIX=$(ls -1 "$OUTPUT_DIR"/antigravity-icons-supercharged-gray-*.vsix 2>/dev/null | sort -V | tail -n 1)
  BLUE_VSIX=$(ls -1 "$OUTPUT_DIR"/antigravity-icons-supercharged-blue-*.vsix 2>/dev/null | sort -V | tail -n 1)

  if [ -n "$GRAY_VSIX" ]; then
    echo "📦 Installing $GRAY_VSIX..."
    antigravity --install-extension "$GRAY_VSIX" --force
  else
    echo "⚠️  Gray VSIX not found in $OUTPUT_DIR/"
  fi

  if [ -n "$BLUE_VSIX" ]; then
    echo "📦 Installing $BLUE_VSIX..."
    antigravity --install-extension "$BLUE_VSIX" --force
  else
    echo "⚠️  Blue VSIX not found in $OUTPUT_DIR/"
  fi

else
  echo "❌ Error: $OUTPUT_DIR directory not found! Run 'bun run package' first."
  exit 1
fi

echo "✅ Extensions successfully installed in AntiGravity!"
