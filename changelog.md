# Change Log

## 1.9.0

-   ✨ Add better support for Emoji and CJK (Chinese, Japanese, Korean) characters.

## 1.8.1

-   🐛 Fix running in containers.

## 1.8.0

-   Scroll the viewport around the jumped line. Thanks @myonov !

## 1.7.4

-   Add `ui` to `extensionKind`. Thanks @kyleburke-meq !

## 1.7.3

-   🔒️ Some security updates from dependabot.

## 1.7.2

-   ⬆️ Switch to `npm-run-all2` for now.

## 1.7.1

-   🐛 Avoid labeling co-pilot's embedded editors!

## 1.7.0

-   ✨ Add "checkered-mode" (alternate label colors like a checkers/chess board). See `README.md` for override details. Decided to make this mode the default so it's debatably a "breaking" change for users with extensive custom color overrides.
-   Add LinkedIn link (https://www.linkedin.com/in/david-l-goldberg-24607a314) since I'm looking for a job!

## 1.6.0

-   🐛 Fix rendering of custom line heights!
-   ✨ Add ability to click Jumpy's status bar item to view your achievements.
-   Improve default `jumpy2.labelBorderColor` to improve clarity when labels are adjacent. Useful for more aggressive regexes.
-   ⌨️ Add link to https://bracklets.com (a typing training program I recently released).
-   ⬆️ Upgrade a lot of dependencies.

## 1.5.2

-   Slight fix for memory management and some cleanup.

## 1.5.1

-   Sync the updates notification for users of synced settings (See 1.5.0 below).

## 1.5.0

-   ✨ Add an achievements page/behavior and command (replaces career jumps command). Feel free to disable it in the options. To run (usually command/ctrl+shift+p) -> `Jumpy: Show Jumpy Achievements (career jumps)`
-   ✨ Add an updates page/behavior and command, that pulls in the CHANGELOG.md. To run (usually command/ctrl+shift+p) -> `Jumpy: Show Updates`
-   👕 New Jumpy T-Shirts available! https://www.bonfire.com/store/jumpy/ !!!

## 1.4.1

-   Dependabot patches.

## 1.4.0

-   ✨ Add a selection mode "jumpy2.toggleSelection", defaults to: <kbd>shift</kbd> + <kbd>alt</kbd> + <kbd>enter</kbd>. Thanks @FredBill1 for the PR!!!

## 1.3.0

-   ✨ Add a little beacon after a jump. Best we can do now (easily) with the API. Thanks @FredBill1 for the PR!!!

## 1.2.1

-   👷 Add Azure pipelines build. Add deploy/publish, so bumping to test.

## 1.2.0

-   ✨ Add a themable border around the labels.
-   🐛 Fix label alignment with various font sizes.

## 1.1.0

-   Add a command to view your total career jumps!

## 1.0.2

-   Fix build.
-   Security update with dependabot.

## 1.0.1

-   Fix some event handlers

## 1.0.0

-   Initial release
