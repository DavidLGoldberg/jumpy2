# jumpy-vscode README

This is the README for your extension "jumpy-vscode". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

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

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

**Note:** You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

-   Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
-   Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
-   Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

-   [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
-   [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

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
        "when": "jumpy.jump-mode"
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
