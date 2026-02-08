# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jumpy2 is a VS Code extension that creates dynamic hotkeys to jump around files across visible panes. Users press `shift+enter`, see labels appear at word positions, type 2 characters, and jump directly to that location. Works seamlessly with vim/neovim extensions.

## Essential Commands

**IMPORTANT: Node Version Management**
This project requires Node 20.18.1. ALWAYS run `nvm use` before executing any npm commands to ensure the correct Node version is active.

### Development

```bash
# Switch to correct Node version (REQUIRED FIRST STEP)
nvm use

# Install dependencies
npm install

# Development watch mode (both TypeScript + esbuild)
npm run watch

# Build for production
npm run compile

# Type checking only
npm run check-types

# Lint code
npm run lint
```

### Testing

```bash
# Switch to correct Node version first
nvm use

# Run all tests (includes pretest compile and lint)
npm test

# Run tests without recompiling (faster iteration)
npm run test-no-compile

# Compile tests only
npm run compile-tests

# Watch tests (auto-recompile)
npm run watch-tests
```

### Publishing

```bash
# Publish to VS Code marketplace
npm run deploy
```

## Architecture Overview

### Hybrid TypeScript + Elm Architecture

This extension uses a **unique hybrid architecture** that's critical to understand:

**TypeScript Layer** (`src/extension.ts`)
- Handles all VS Code API interactions
- Manages extension lifecycle, commands, and keybindings
- Coordinates label rendering via VS Code decorations
- Integrates telemetry and global state (achievements, career jumps)

**Elm State Machine** (`src/elm/StateMachineVSC.elm`)
- Pure functional state management for jump mode logic
- Processes key sequences and matches them to labels
- Compiled separately to JavaScript and imported by TypeScript
- Communicates via **ports** (Elm's FFI mechanism)

### Port-Based Communication Pattern

```
User presses key → TypeScript → stateMachine.ports.key.send(charCode)
                                        ↓
                              Elm processes state
                                        ↓
Elm port emits → validKeyEntered/labelJumped → TypeScript
                                        ↓
                     TypeScript updates UI/performs jump
```

**Outbound Ports (Elm → TypeScript):**
- `activeChanged`: Jump mode on/off
- `statusChanged`: Status bar text updates
- `validKeyEntered`: Filter labels after first character
- `labelJumped`: Execute jump to position

**Inbound Ports (TypeScript → Elm):**
- `getLabels`: Initialize with available labels
- `key`: User pressed a character
- `reset`: Backspace pressed, reset first character
- `exit`: Exit jump mode

### Label System Architecture

**Labeler Pattern** (`src/labelers/`)
- `words.ts`: Main `WordLabel` class implementing `Label` interface
- Finds word positions using configurable regex (`jumpy2.wordPattern`)
- Generates two-character key sequences from available character set
- Handles **wide characters** (CJK/emoji) with adjusted positioning

**Decoration System:**
- `wordDecorations.ts`: Two decoration types (base + checkered)
- Checkered mode alternates colors for adjacent labels
- Labels rendered as "after" decorations (pseudo-elements)
- Beacons (`wordBeacons.ts`): Animated red flash after jump

**Multi-Editor Support:**
Labels are generated across all `window.visibleTextEditors`, enabling jumps across split panes in a single activation.

### Dynamic Command Registration

The extension dynamically registers commands for every character:
- `jumpy2.a`, `jumpy2.b`, ..., `jumpy2.z`
- `jumpy2.A`, `jumpy2.B`, ..., `jumpy2.Z`

This happens at activation using `getAllKeys()` and iterating through character sets.

### Context-Based Keybindings

Uses `jumpy2.jump-mode` context (set via `setContext` command):
- When active: character keys route to Jumpy commands
- When inactive: normal editor keybindings apply
- Critical for vim/neovim integration and preventing key conflicts

### Debounced Exit Pattern

Multiple editor events trigger exit to handle user actions gracefully:
```typescript
window.onDidChangeActiveTextEditor
window.onDidChangeTextEditorSelection
window.onDidChangeVisibleTextEditors
// ... and others
```

All route through `_exitDebounced()` (350ms debounce, leading edge) to prevent premature mode clearing during normal operations.

## Working with Elm Code

### Critical: Separate Elm Compilation

Elm files must be compiled **before** esbuild can bundle the extension. The build system expects compiled Elm at `out/elm/StateMachineVSC.js`.

```bash
# Compile Elm manually if needed
elm make src/elm/StateMachineVSC.elm --output=out/elm/StateMachineVSC.js

# Run Elm tests
elm-test
```

Elm source is in `src/elm/`, tests in `tests/`.

**Note:** `StateMachineAtom.elm` and `AtomStatusFunctions.elm` are legacy from the original Atom package port.

## Testing

### Launch Configurations

Use VS Code's debug panel (F5):
- "Run Jumpy2 +extensions": Test with other extensions enabled
- "Run Jumpy2 -extensions": Isolated testing
- "Test without extensions": Run test suite isolated
- "Test with extensions": Run tests with vim/neovim extensions

### Test Structure

Tests are in `src/test/suite/`:
- `basics.test.ts`: Core jump functionality
- `unicode.test.ts`: Unicode/CJK/emoji support
- `customKeys.test.ts`: Custom character set configuration
- `largefile.test.ts`: Performance with large files
- `multipleEditors.test.ts`: Multi-pane scenarios
- `achievements.test.ts`: Achievement tracking
- `status.test.ts`: Status bar display

## Unicode and Wide Character Handling

The extension specially handles **double-width characters**:

```typescript
// CJK characters and emojis render as ~2 visual columns
isWideCharacter(char: string): boolean {
    return /[\u3000-\u9FFF...]|\p{Extended_Pictographic}/u.test(char);
}
```

- Wide chars: decoration covers 1 char position (visually ~2 cols)
- ASCII chars: decoration covers 2 char positions (visually 2 cols)
- Margin adjustments prevent label misalignment

Default `wordPattern` includes `\p{Extended_Pictographic}` for emoji support.

## Configuration System

Key settings (from `package.json` contributes):

- `jumpy2.customKeys`: Character set for labels (default: "abcdefghijklmnopqrstuvwxyz")
- `jumpy2.wordPattern`: Regex for jump targets (supports Unicode via `\p{}`)
- `jumpy2.checkered.active`: Alternating label colors (default: true)
- `jumpy2.revealAfterJump`: Viewport positioning after jump (null, "minscroll", "center", "attop")
- `jumpy2.achievements.active`: Achievement pop-ups (default: true)
- `jumpy2.jumperEmojis.active`: Emoji display on activation (default: true)

Theme colors: `jumpy2.labelBackgroundColor`, `jumpy2.labelFontColor`, `jumpy2.labelBorderColor`, `jumpy2.checkered_*` variants, `jumpy2.beaconColor`

## Build System Details

- **esbuild** for fast bundling (`esbuild.js`)
- Entry: `src/extension.ts` → Output: `out/extension.js`
- Format: CommonJS, Platform: Node
- External: `vscode` module (provided by VS Code)
- Production: minified, no sourcemaps
- Development: sourcemaps enabled
- TypeScript: strict mode, ES2022 target, Node16 module resolution

## State Management

**Global State** (persisted via `ExtensionContext.globalState`):
- `careerJumpsMade`: Total jumps across all sessions (synced)
- `previousVersion`: For update notifications (synced)

**In-Memory State:**
- `allLabels`: Current label set (regenerated on each activation)
- `isSelectionMode`: Toggle vs. selection mode flag
- Elm state machine: Current entered keys, available labels

## Vim/Neovim Integration Notes

- Extension keybindings have lower priority than vim/neovim extensions
- Users must create **user-level** keybinding overrides in `keybindings.json` to make backspace work in jump mode
- Recommended: bind `f` to `jumpy2.toggle` in vim normal mode
- Context checks: `jumpy2.jump-mode && editorTextFocus` for Jumpy keys

## Known Limitations

- Cannot jump to tree view or tabs (only text editors)
- Requires manual Elm compilation if modifying state machine
- Some editor events intentionally commented out (`onDidChangeTextDocument`) to prevent aggressive mode clearing

## Telemetry

Uses `@vscode/extension-telemetry` with Application Insights:
- Events: jump, toggle, key-pressed, reset, exit, achievements
- Respects VS Code telemetry settings
- Tracks: career jumps, key sequences, settings configuration
