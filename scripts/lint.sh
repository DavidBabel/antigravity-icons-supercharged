#!/bin/bash

# Configuration
NESTED_CONFIG="./vscode-symbols/biome.json"
BACKUP_CONFIG="./vscode-symbols/biome.json.bak"

# 1. Prepare: Hide nested config if it exists
if [ -f "$NESTED_CONFIG" ]; then
  mv "$NESTED_CONFIG" "$BACKUP_CONFIG" || { echo -e "\x1b[33m\x1b[1m⚠️ Warning: Failed to move nested Biome config. Linting might be affected.\x1b[0m"; }
fi

# 2. Execute: Run biome lint/check
# We use "$@" to pass any arguments (like --write) from the npm script
./node_modules/.bin/biome check "$@"
EXIT_CODE=$?

# 3. Cleanup: Restore nested config if backup exists
if [ -f "$BACKUP_CONFIG" ]; then
  mv "$BACKUP_CONFIG" "$NESTED_CONFIG" || { echo -e "\x1b[33m\x1b[1m⚠️ Warning: Failed to restore nested Biome config.\x1b[0m"; }
fi

# Exit with biome's status code
exit $EXIT_CODE
