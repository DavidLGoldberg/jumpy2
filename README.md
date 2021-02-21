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

## Working with Markdown

if `f` vim functionality is desired:
open settings as json and add

```
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": [
        "f"
      ],
      "commands": [
        "jumpy.toggle"
      ]
    }
  ],
```

If you want to use backspace for reset. This currently removes backspace from working in vim in normal mode

in key settings (TODO tell how to get here):

```
    // Remove vim's
    {
        "key": "backspace",
        "command": "-extension.vim_backspace",
        "when": "editorTextFocus && vim.active && !inDebugRepl"
    },
    {
        "key": "shift+backspace",
        "command": "-extension.vim_shift+backspace",
        "when": "editorTextFocus && vim.active && vim.use<shift+BS> && !inDebugRepl && vim.mode == 'SearchInProgressMode'"
    },

    // Set Jumpy's
    {
        "key": "backspace",
        "command": "jumpy.reset",
        "when": "jumpy.jump-mode && editorTextFocus"
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
