#!/usr/bin/env bash
set -euo pipefail

# Deploy the Astro site to github.com/ht4w5/ht4w5.github.io
# Usage: ./deploy.sh

REPO="git@github.com:ht4w5/ht4w5.github.io.git"
DEPLOY_BRANCH="main"
BUILD_DIR="dist"
TMP_DIR=$(mktemp -d)

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "==> Building site…"
pnpm astro build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Error: $BUILD_DIR not found after build." >&2
  exit 1
fi

echo "==> Cloning $REPO into $TMP_DIR…"
git clone --depth 1 --branch "$DEPLOY_BRANCH" "$REPO" "$TMP_DIR"

# Remove old files (preserve .git and any dotfiles the repo needs like CNAME)
find "$TMP_DIR" -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name 'CNAME' \
  -exec rm -rf {} +

echo "==> Copying $BUILD_DIR → $TMP_DIR…"
cp -r "$BUILD_DIR"/. "$TMP_DIR"/

cd "$TMP_DIR"
git add -A
git diff --cached --quiet && { echo "Nothing to deploy – build unchanged."; exit 0; }

git commit -m "deploy: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
git push origin "$DEPLOY_BRANCH"

echo "==> Deployed to $REPO ($DEPLOY_BRANCH)"