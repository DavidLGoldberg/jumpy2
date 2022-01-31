# Jumpy2

## Vim integration (see neovim below if interested)

if <key>f</key> vim functionality is desired:
open settings as json and add

```json
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": [
        "f"
      ],
      "commands": [
        "jumpy2.toggle"
      ]
    }
  ],
```

I currently use <key>backspace</key> as my back navigation key (built into VS Code).
This overrides the normal boring backspace functionality from vim in normal mode.

**in key settings (TODO tell how to get here):**

```json
    // Set Jumpy's `reset` command to backspace
    {
        "key": "backspace",
        "command": "jumpy2.reset",
        "when": "jumpy2.jump-mode && editorTextFocus"
    }

    // Set more useful backspace, shift+backspace back and forward functionality (especially for Jumpy!)
    {
        "key": "backspace",
        "command": "workbench.action.navigateBack",
        "when": "editorTextFocus && vim.active && !inDebugRepl && vim.mode == 'Normal'"
    },
    {
        "key": "shift+backspace",
        "command": "workbench.action.navigateForward",
        "when": "editorTextFocus && vim.active && !inDebugRepl && vim.mode == 'Normal'"
    },
```

## Colors

To override Jumpy's default label colors (black on green) try this
In your VS Code's `settings.json` file:

```json
"workbench.colorCustomizations": {
  "jumpy2.labelFontColor": "#000000", // black
  "jumpy2.labelBackgroundColor": "#ff0000" // on red
},
```

_However_, it is probably wise to leave the defaults, and instead scope this to a theme or wildcarded (modified from [VS Code's examples](https://code.visualstudio.com/docs/getstarted/themes#_editor-syntax-highlighting) like so:

```json
"workbench.colorCustomizations": {
  // NOTE: not all dark and light themes are conveniently labeled "dark" or "light" like this.
  // In that case, you can specify per theme, or again, just leave Jumpy's default or override the default with the example above.
  "[*Dark*]": {
    "jumpy2.labelFontColor": "#000000",
    "jumpy2.labelBackgroundColor": "#FFFFFF"
  },
  "[*Light*]": {
    "jumpy2.labelFontColor": "#FFFFFF",
    "jumpy2.labelBackgroundColor": "#000000"
  }
},
```

## Custom set of keys to use (easier to type / faster?):

```json
"jumpy2.customKeys": {
    "type": "array",
    "default": "fjdkslaghrueiwoncmv",
    "description": "Default characters to use"
},
```

The default might be easier for beginners. It is also probably better for larger screens (more labels before jumpy has to resort to utliizing uppercase letters).

```json
"jumpy2.customKeys": {
    "type": "array",
    "default": "abcdefghijklmnopqrstuvwxyz",
    "description": "Default characters to use"
},
```

## Neovim Integration

_NOTE: I haven't fully configured neovim but used it successfully for a while with the following_:

```json
  {
      "key": "f",
      "command": "jumpy2.toggle",
      "when": "neovim.mode =~ /^normal$|^visual$/ && !jumpy2.jump-mode && editorTextFocus"
  },
  {
    "key": "escape",
    "command": "jumpy2.exit",
    "when": "neovim.init && jumpy2.jump-mode && editorTextFocus"
  }
```

for back and forward functionality with neovim:

```json
  {
  "key": "backspace",
  "command": "workbench.action.navigateBack",
  "when": "editorTextFocus && !inDebugRepl && neovim.mode != 'insert'"
  },
{
  "key": "shift+backspace",
  "command": "workbench.action.navigateForward",
  "when": "editorTextFocus && !inDebugRepl && neovim.mode != 'insert'"
}
```

## Fun

Change the 'jumper' set (emojis)
in your VS Code's `settings.json`

add:

```json
  "jumpy2.jumperEmojis.jumperSet": ["🐒"],
```

_The above tells jumpy to use the monkey emoji exclusively._

## Known Issues

-   Can not jump to treeview or tabs.

## Support Jumpy2

-   Sponsor me on Github [David L Goldberg](https://github.com/sponsors/DavidLGoldberg)
-   Support me on [Patreon](https://www.patreon.com/davidlgoldberg)
-   Support me via [crypto](./crypto-donations.md)
