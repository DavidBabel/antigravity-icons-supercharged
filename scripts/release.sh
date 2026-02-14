#!/bin/bash

echo "🚀 Creating a new release..."

# 1. Bump version in package.json (minor)
bun --eval "
  const pkg = await Bun.file('package.json').json();
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  pkg.version = [major, minor + 1, 0].join('.');
  await Bun.write('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log(pkg.version);
" > /tmp/.release-version

VERSION=$(cat /tmp/.release-version)
rm /tmp/.release-version

# 2. Commit, tag, and push (tag push triggers publish workflow)
git add -A
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin HEAD --follow-tags

echo "✅ Release v$VERSION pushed — publish workflow will trigger on tag v$VERSION"
