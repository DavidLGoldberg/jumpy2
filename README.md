# jumpy-vscode README

## Features

## Requirements

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

-   `myExtension.enable`: enable/disable this extension
-   `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

## Vim integration (see neovim below if interested)

if <key>f</key> vim functionality is desired:
open settings as json and add

```
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

```
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

To set theme overrides (label background and font color):
This will override the defaults for dark, light, and highcontrast respectively.
In `settings.json` file:

DON'T DO THIS (probably):

```
"workbench.colorCustomizations": {
  "jumpy2.labelFontColor": "#97081b",
  "jumpy2.labelBackgroundColor": "#00AA00"
},
```

However, it is probably wise to leave the defaults, and rather scope this to a theme like so:
DO THIS (probably):

TODO: !!!! find this code block....it has like a [] around the theme, in the syntax

```
"workbench.colorCustomizations": {
  "jumpy2.labelFontColor": "#97081b",
  "jumpy2.labelBackgroundColor": "#00AA00"
},
```

Custom set of keys to use (easier to type / faster?):

```
"jumpy2.customKeys": {
    "type": "array",
    "default": "fjdkslaghrueiwoncmv",
    "description": "Default characters to use"
},
```

The default might be easier for beginners. It is probably better for larger screens (more labels before jumpy has to resort to utliizing uppercase letters).

```
"jumpy2.customKeys": {
    "type": "array",
    "default": "abcdefghijklmnopqrstuvwxyz",
    "description": "Default characters to use"
},
```

## Neovim Integration

_NOTE: I haven't fully configured neovim but used it successfully for a while with the following_:

```
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

```
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
in `settings.json` ie. on a mac `~/Library/Application Support/Code/User/settings.json`

add:

```
  "jumpy2.jumperEmojis.jumperSet": ["🐒"],
```

_The above tells jumpy to use the monkey emoji exclusively._
