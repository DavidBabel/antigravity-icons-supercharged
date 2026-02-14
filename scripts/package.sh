#!/bin/bash

# Configuration
BUILD_GRAY="build-gray"
BUILD_BLUE="build-blue"
OUTPUT_DIR="build"

# 1. Run build
bun run build

# 2. Create output directory
mkdir -p "$OUTPUT_DIR"

# 3. Package Gray
if [ -d "$BUILD_GRAY" ]; then
  echo "📦 Packaging $BUILD_GRAY..."
  cd "$BUILD_GRAY" || exit 1
  vsce package --out "../$OUTPUT_DIR"
  cd ..
else
  echo "❌ Error: $BUILD_GRAY directory not found!"
  exit 1
fi

# 4. Package Blue
if [ -d "$BUILD_BLUE" ]; then
  echo "📦 Packaging $BUILD_BLUE..."
  cd "$BUILD_BLUE" || exit 1
  vsce package --out "../$OUTPUT_DIR"
  cd ..
else
  echo "❌ Error: $BUILD_BLUE directory not found!"
  exit 1
fi

echo "✅ Packaging complete. Artifacts are in $OUTPUT_DIR/"
