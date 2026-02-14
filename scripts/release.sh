#!/bin/bash

echo "🚀 Creating a new release..."
echo ""
echo "Choose version bump type:"
echo "  1) Patch  (0.1.0 → 0.1.1) [default]"
echo "  2) Minor  (0.1.0 → 0.2.0)"
echo "  3) Major  (0.1.0 → 1.0.0)"
echo ""
read -p "Your choice (1/2/3): " BUMP_TYPE

# Default to patch
if [ -z "$BUMP_TYPE" ]; then
  BUMP_TYPE="1"
fi

case "$BUMP_TYPE" in
  1) BUMP="patch" ;;
  2) BUMP="minor" ;;
  3) BUMP="major" ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

# 1. Bump version in package.json
bun --eval "
  const bump = '$BUMP';
  const pkg = await Bun.file('package.json').json();
  let [major, minor, patch] = pkg.version.split('.').map(Number);
  if (bump === 'major') { major++; minor = 0; patch = 0; }
  else if (bump === 'minor') { minor++; patch = 0; }
  else { patch++; }
  pkg.version = [major, minor, patch].join('.');
  await Bun.write('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log(pkg.version);
" > /tmp/.release-version

VERSION=$(cat /tmp/.release-version)
rm /tmp/.release-version

echo ""
echo "📦 Bumping to v$VERSION ($BUMP)..."

# 2. Commit, tag, and push (tag push triggers publish workflow)
git add -A
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin HEAD
git push origin "v$VERSION"

echo "✅ Release v$VERSION pushed — publish workflow will trigger on tag v$VERSION"
