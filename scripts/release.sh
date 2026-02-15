#!/bin/bash

# 0. Linting before release
echo "🔍 Running lint check before release..."
if ! bun run lint; then
  echo ""
  echo "❌ Lint check failed! Please fix linting errors before creating a release."
  exit 1
fi

echo ""
VERSIONS=$(bun --eval "
  const pkg = await Bun.file('package.json').json();
  const v = pkg.version;
  const [major, minor, patch] = v.split('.').map(Number);
  console.log([
    v,
    [major, minor, patch + 1].join('.'),
    [major, minor + 1, 0].join('.'),
    [major + 1, 0, 0].join('.')
  ].join(' '));
")

CURRENT_V=$(echo $VERSIONS | cut -d' ' -f1)
PATCH_V=$(echo $VERSIONS | cut -d' ' -f2)
MINOR_V=$(echo $VERSIONS | cut -d' ' -f3)
MAJOR_V=$(echo $VERSIONS | cut -d' ' -f4)

echo "🚀 Creating a new release (current: v$CURRENT_V)..."
echo ""
echo "Choose version bump type:"
echo "  1) Patch  ($CURRENT_V → $PATCH_V) [default]"
echo "  2) Minor  ($CURRENT_V → $MINOR_V)"
echo "  3) Major  ($CURRENT_V → $MAJOR_V)"
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

# 1.5. Run build to ensure everything is correct before pushing
echo "🛠️ Running build check before pushing..."
if ! bun run build; then
  echo ""
  echo "❌ Build failed! Aborting release."
  # Revert the version bump in package.json
  git checkout package.json
  exit 1
fi

# 2. Commit, tag, and push (tag push triggers publish workflow)
git add -A
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin HEAD
git push origin "v$VERSION"

echo "✅ Release v$VERSION pushed — publish workflow will trigger on tag v$VERSION"
