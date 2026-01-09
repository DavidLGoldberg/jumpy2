# Jumpy2

[![GitHub Release](https://img.shields.io/github/v/release/davidlgoldberg/jumpy2)](https://github.com/davidlgoldberg/jumpy2/releases)
[![VS Code Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/davidlgoldberg.jumpy2)](https://marketplace.visualstudio.com/items?itemName=davidlgoldberg.jumpy2)
[![VS Code Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/davidlgoldberg.jumpy2)](https://marketplace.visualstudio.com/items?itemName=davidlgoldberg.jumpy2)
[![VS Code Marketplace Average Rating](https://img.shields.io/visual-studio-marketplace/r/davidlgoldberg.jumpy2)](https://marketplace.visualstudio.com/items?itemName=davidlgoldberg.jumpy2)
[![License](https://img.shields.io/github/license/davidlgoldberg/jumpy2)](https://github.com/davidlgoldberg/jumpy2/blob/main/LICENSE.md)

A VS Code extension that creates dynamic hotkeys to jump around files across visible panes. It's a new 'Jumpy' but from the original author (Atom package) for VS Code. It works with the major VSC vim extensions and I plan to maintain it.

## How to jump

1. Hit <kbd>shift</kbd> + <kbd>enter</kbd>
2. Choose from your presented labels:
3. Enter two characters.
4. Keep coding!

Watch the demo:

[![Jumpy2 demo on youtube.com](https://img.youtube.com/vi/ClqiG3xskKM/0.jpg)](https://www.youtube.com/watch?v=ClqiG3xskKM)

## Install

On command line:

```bash
code --install-extension davidlgoldberg.jumpy2
```

## Notes

-   Works great with or without [vim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim "vim extension's homepage") or [neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim "neo vim extension's homepage")! See vim/nvim integration below
-   Vim modes supported:
    -   command mode
    -   insert mode
-   🆕 Now supports _Unicode_, _CJK_, and _Emoji_! **NOTE**: If you have customized `jumpy2.wordPattern`, you may want to reset it to use the _new_ default value that includes Unicode support.
-   Recommended key mappings to replace 'f' in vim integration below.
-   Recommended key mappings for back and forward below.

## Key Bindings

### Defaults

-   Enter jump mode
    -   <kbd>shift</kbd> + <kbd>enter</kbd>
-   Enter selection mode
    -   <kbd>shift</kbd> + <kbd>alt</kbd> + <kbd>enter</kbd>
-   Reset first character entered
    -   <kbd>backspace</kbd>
-   Cancel/exit jump mode (any of the following)
    -   <kbd>shift</kbd> + <kbd>enter</kbd>
    -   <kbd>enter</kbd>
    -   <kbd>esc</kbd>
    -   <kbd>space</kbd>

## Jump back and forward

Did you know VS Code has built in backwards and forward navigation functionality? You should _probably_ map that to a hotkey for Jumpy!
I currently use the <kbd>backspace</kbd> key which overrides the default boring backspace functionality from vim (while in normal mode only of course).

For example with [vim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) Edit this in your `keybindings.json` file:

```json
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

## Custom set of keys to use (easier to type / faster?)

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

## Colors & Border

To override Jumpy's default label colors (black on green) try this
In your VS Code's `settings.json` file:

```js
"workbench.colorCustomizations": {
  "jumpy2.beaconColor": "#ff0000af", // transparent red

  "jumpy2.labelFontColor": "#000000", // black font
  "jumpy2.labelBackgroundColor": "#ff0000", // red bg
  // In this example you would probably want to change the border to black if NOT using checkered-mode (below)
  // (useful when you have aggressive regexes with adjacent labels!)
  "jumpy2.labelBorderColor": "#ff0000", // red border

  // Checkered-mode (or Chess-mode) is the new default setting which alternates colors (like zebra stripes).
  // These styles are optional while using checkered-mode:
  "jumpy2.checkered_labelFontColor": "#ff0000", // red font
  "jumpy2.checkered_labelBackgroundColor": "#000000", // black bg
  "jumpy2.checkered_labelBorderColor": "#000000", // black border
},
```

_However_, it is probably wise to leave the defaults, and instead scope this to a theme or wildcarded (modified from [VS Code's examples](https://code.visualstudio.com/docs/getstarted/themes#_editor-syntax-highlighting) like so:

```js
"workbench.colorCustomizations": {
  // NOTE: not all dark and light themes are conveniently labeled "dark" or "light" like this.
  // In that case, you can specify per theme, or again, just leave Jumpy's default or override the default with the example above.
  "[*Dark*]": {
    "jumpy2.labelFontColor": "#000000",
    "jumpy2.labelBackgroundColor": "#FFFFFF",
    "jumpy2.labelBorderColor": "#FF0000",
    "jumpy2.beaconColor": "#FF0000AF",
  },
  "[*Light*]": {
    "jumpy2.labelFontColor": "#FFFFFF",
    "jumpy2.labelBackgroundColor": "#000000",
    "jumpy2.labelBorderColor": "#FF0000",
    "jumpy2.beaconColor": "#FF0000AF",
  }
},
```

## Vim integration

(_see neovim below if interested_)

### Override vim's extension level backspace

If you want the <kbd>backspace</kbd> key to work as the jumpy "reset" command you **must** define a "_user_" level keybindings override in `keybindings.json` to override vim's "_extension_" level keybinding:

```json
{
    "key": "backspace",
    "command": "jumpy2.reset",
    "when": "jumpy2.jump-mode && editorTextFocus"
}
```

(_feel free to bind it to another key as well_)

### Bind 'f' and/or 'F' key

if <kbd>f</kbd> vim functionality is desired:
open settings as json and add:

```json
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      "before": ["f"],
      "commands": ["jumpy2.toggle"]
    },
    {
      "before": ["F"],
      "commands": ["jumpy2.toggleSelection"]
    }
  ],
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

### See your achievements(!)

command palette (usually <kbd>command/ctrl</kbd>+<kbd>shift</kbd>+<kbd>p</kbd>) -> `Jumpy: Show Jumpy Achievements (career jumps)`
_(a real ninja would bind it to a key though)_

You can also _disable_ this pop up if you're an uber important 1337 10x h4x0r that can't afford to hot key a tab closed once a year...

```json
  "jumpy2.achievements.active": false,
```

### Emojis (Subtly useful)

Change the 'jumper' set (emojis)
in your VS Code's `settings.json`

add:

```json
  "jumpy2.jumperEmojis.jumperSet": ["🐒"],
```

_The above tells jumpy to use the monkey emoji exclusively._

Of course you can turn these off too. If you have no soul.

```json
  "jumpy2.jumperEmojis.active": false,
```

## Known Issues

-   Can not jump to treeview or tabs.

## Acknowledgements

-   Various [contributors](https://github.com/DavidLGoldberg/jumpy/graphs/contributors) from the original atom project.
-   Logo icon created by [Dr. Gregory W. Goldberg](https://scholar.google.com/citations?hl=en&user=zNw4iZkAAAAJ&view_op=list_works) (in his spare time!) and David L. Goldberg."
-   Implementation inspiration from [Wayne Maurer](https://github.com/wmaurer) (the author of the first VS Code implementation of Jumpy)

## Related work

-   Other Jumpies:

    -   Original [Jumpy](https://github.com/davidlgoldberg/jumpy) | [Jumpy (archived)](https://web.archive.org/web/20221215010328/https://atom.io/packages/jumpy) for Atom
    -   First [Jumpy](https://marketplace.visualstudio.com/items?itemName=wmaurer.vscode-jumpy) to make it to VS Code
    -   VS Code 'jumpy' search [results](https://marketplace.visualstudio.com/search?term=jumpy&target=VSCode&category=All%20categories&sortBy=Relevance)
    -   [Jumpy for Sublime](https://packagecontrol.io/packages/Jumpy)

-   Ace Jump maintains a nice [comparison list](https://github.com/acejump/AceJump#comparison) of hotkey/jump related programs

(should we _collab_ more? Reach out!)

## Keywords

(A little SEO juice)

-   Shortcuts
-   Navigation
-   Productivity
-   Mouseless
-   Plugin
-   Extension

## My previous Atom packages :)

-   [Jumpy](https://github.com/davidlgoldberg/jumpy) | [Jumpy (archived)](https://web.archive.org/web/20221215010328/https://atom.io/packages/jumpy)
-   [Jumpy-beacon](https://github.com/davidlgoldberg/jumpy-beacon) | [Jumpy-beacon (archived)](https://web.archive.org/web/20221215010501/https://atom.io/packages/jumpy-beacon)
-   [Qolor](https://github.com/davidlgoldberg/qolor) | [Qolor (archived)](https://web.archive.org/web/20221215010858/https://atom.io/packages/qolor)

## Keyboard Enthusiast?

I made [Bracklets](https://bracklets.com) — a minimal typing training tool for computer programmers or any keyboard enthusiasts who want to learn a new keyboard layout!
It offers focused and customizable drills, inspired by drumming rudiments, for developing muscle memory. Use it to learn any key, but especially those pesky brackets and curlies!

## Support Jumpy2

-   👕 Buy a [Jumpy T-SHIRT](https://www.bonfire.com/store/jumpy)!
-   Sponsor me on Github [David L Goldberg](https://github.com/sponsors/DavidLGoldberg)
-   Support me on [Patreon](https://www.patreon.com/davidlgoldberg)
-   Support me via [crypto](./crypto-donations.md)
-   Subscribe to my [YouTube channel](https://www.youtube.com/channel/UCi6p1uTlAozufNiQgpgpW-Q)
-   🧑‍💻 Hire me! [LinkedIn](https://www.linkedin.com/in/david-l-goldberg-24607a314)
