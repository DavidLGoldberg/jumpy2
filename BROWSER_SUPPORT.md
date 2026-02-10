# Browser Mode Support

This document covers browser-specific testing and verification for Jumpy2's web support.

## 🧪 Testing Browser Support

### Local Browser Testing

```bash
# Install dependencies
npm install

# Build the web extension
npm run compile-web

# Test in browser
npm run run-in-browser
```

This opens VS Code in Chromium with your extension loaded.

### Verify Both Bundles Build

The extension now builds both Node.js and browser bundles:

```bash
npm run vscode:prepublish

# Check that both exist:
ls -la out/extension.js      # Node bundle (desktop)
ls -la dist/web/extension.js # Web bundle (browser)
```

## 🌐 Testing on github.dev

After the extension is published:

1. Go to any GitHub repository
2. Press `.` (period) to open github.dev
3. Open Extensions panel (Cmd/Ctrl+Shift+X)
4. Search for "Jumpy2"
5. Install and test

The extension should work exactly as it does in desktop VS Code!

## 📝 Browser Testing Checklist

### Core Functionality

-   [ ] Activate jump mode (Shift+Enter)
-   [ ] Labels appear correctly
-   [ ] Jumping to positions works
-   [ ] Selection mode works (Shift+Alt+Enter)
-   [ ] Reset works (Backspace)
-   [ ] Exit works (Esc, Enter, Space)
-   [ ] Multiple visible editors work
-   [ ] Custom keys setting works
-   [ ] Word pattern setting works

### UI Features

-   [ ] Emoji jumpers display
-   [ ] Checkered mode works
-   [ ] Colors/themes work correctly
-   [ ] Status bar updates

### Commands

-   [ ] Show Achievements works
-   [ ] Show Updates works (should link to GitHub in browser)
-   [ ] All keyboard shortcuts work

## 🎯 Browser-Specific Behavior

### Differences in Browser Mode

-   **Changelog Display**: Links to GitHub instead of showing inline (filesystem not available)
-   **Everything Else**: Works identically to desktop

### How It Works

The extension automatically detects the environment and adapts:

-   Uses `fs` module when available (desktop)
-   Falls back to GitHub links when not (browser)
-   All core functionality is platform-agnostic

## 🐛 Troubleshooting

### Extension Not Appearing on github.dev

1. Verify `"browser"` field exists in package.json
2. Check `extensionKind` is set to `["workspace", "ui"]`
3. Ensure dist/web/extension.js is included in the published package

### Build Errors

-   Make sure Elm is compiled: `make elm-build`
-   Check that out/elm/StateMachineVSC.js exists
-   Verify all dependencies installed: `npm install`

### Runtime Errors in Browser

-   Check browser console for errors
-   Verify no Node.js APIs are being called directly
-   Test with `npm run run-in-browser` locally first

## 📊 Verification Commands

```bash
# Verify package.json has browser field
grep -A1 '"browser"' package.json

# Verify web bundle exists and has content
ls -lh dist/web/extension.js

# Verify node bundle exists
ls -lh out/extension.js
```

## Development Scripts

```bash
npm run compile-web    # Build web bundle for development
npm run watch-web      # Watch mode for web development
npm run package-web    # Production build of web bundle
npm run run-in-browser # Test in local browser (Chromium)
```

Build/publish is handled automatically by the Azure pipeline (`make test` and `npm run deploy`).

## 📦 Browser Support Dependencies & Files

### New Dependencies (Web-Specific)

These packages were added specifically for browser support:

-   **`@vscode/test-web`** - Testing framework for VS Code web extensions (uses stable build)
-   **`@types/webpack-env@1.18.5`** - TypeScript types for browser environment
-   **`process@0.11.10`** - Browser polyfill for Node.js `process` global

### New Build Configuration

-   **`esbuild-web.js`** - Browser-specific esbuild configuration
    -   Platform: `browser`
    -   Output: `dist/web/extension.js`
    -   Bundles all dependencies except `vscode` module

### Package.json Changes

-   **`"browser": "./dist/web/extension.js"`** - Entry point for web environments
-   **`"compile-web"`** - Build script for web bundle
-   **`"watch-web"`** - Watch mode for web development
-   **`"package-web"`** - Production build for web bundle
-   **`"run-in-browser"`** - Local browser testing command (uses `--quality=stable` for compatibility)
-   **`"vscode:prepublish"`** - Updated to build both Node and web bundles

### Source Code Changes

-   **`src/updated.ts`** - Made browser-compatible with runtime detection for `fs`/`path` modules

### Configuration Files

-   **`.vscode/launch.json`** - Added "Run Web Extension in VS Code" debug configuration
-   **`.vscodeignore`** - Updated to include `dist/web/` in published package
-   **`.gitignore`** - Added `dist/` and `.vscode-test-web/` to ignore build artifacts
