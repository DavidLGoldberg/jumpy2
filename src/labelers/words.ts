import { Selection, TextEditor, TextEditorRevealType, window } from 'vscode';
import { LabelEnvironment, Label, Labeler, Settings } from '../label-interface';
import { Range, Position } from 'vscode';
import getWordBeaconDecoration from './wordBeacons';

class WordLabel implements Label {
    keyLabel!: string;
    textEditor: TextEditor | undefined;
    lineNumber!: number;
    column!: number;
    settings: Settings | undefined;
    marker!: Range;

    destroy() {}

    // CJK (Chinese, Japanese, Korean) and emoji characters are typically rendered as
    // double-width in monospace fonts.
    private isWideCharacter(char: string): boolean {
        // CJK Unified Ideographs, Hiragana, Katakana, Hangul, fullwidth chars, emojis
        return /[\u3000-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]|\p{Extended_Pictographic}/u.test(
            char
        );
    }

    getDecoration(): any {
        const { lineNumber, column, keyLabel } = this;

        const firstChar =
            this.textEditor?.document.getText(
                new Range(lineNumber, column, lineNumber, column + 1)
            ) || '';
        const isWide = this.isWideCharacter(firstChar);

        // For wide chars (CJK/emoji): cover 1 char position (visually ~2 cols)
        // For ASCII: cover 2 char positions (visually 2 cols)
        const rangeEnd = column + (isWide ? 1 : 2);

        this.marker = new Range(
            new Position(lineNumber, column),
            new Position(lineNumber, rangeEnd)
        );

        // For wide characters, we need less negative margin because
        // 1 wide char already spans ~2 visual columns.
        // Base margin: wide chars ~1.0em, ASCII ~1.265em
        const baseMargin = isWide ? 1.0 : 1.265;
        const margin = `0 0 0 -${baseMargin + Math.random() * 0.0001}em`; // ALSO, Unique fractional value prevents VS Code from deduping decorations

        const label = {
            after: {
                contentText: keyLabel,
                margin,
            },
        };
        const decoration = {
            range: this.marker,
            renderOptions: { dark: label, light: label },
        };

        return decoration;
    }

    animateBeacon() {
        if (!this.textEditor) {
            return;
        }

        const { lineNumber, column } = this;

        // just get a range of 1 character for the beacon
        const beaconMarker = new Range(
            lineNumber,
            column,
            lineNumber,
            column + 1
        );
        const decoration = getWordBeaconDecoration();
        setTimeout(() => {
            decoration.dispose();
        }, 400);
        this.textEditor.setDecorations(decoration, [beaconMarker]);
    }

    async jump(isSelectionMode: boolean) {
        if (this.textEditor) {
            if (this.textEditor !== window.activeTextEditor) {
                await window.showTextDocument(this.textEditor.document.uri, {
                    preview: false,
                    viewColumn: this.textEditor.viewColumn,
                });
            }
            const newActive = new Position(this.lineNumber, this.column);
            this.textEditor.selection = new Selection(
                isSelectionMode ? this.textEditor.selection.anchor : newActive,
                newActive
            );
            if (this.settings?.revealAfterJump) {
                // Position the viewport around the jumped line.
                const revealType = {
                    minscroll: TextEditorRevealType.Default,
                    center: TextEditorRevealType.InCenter,
                    attop: TextEditorRevealType.AtTop,
                }[this.settings.revealAfterJump];
                this.textEditor.revealRange(
                    new Range(newActive, newActive),
                    revealType
                );
            }
        }
    }
}

const labeler: Labeler = function (
    env: LabelEnvironment,
    editor: TextEditor
): Array<WordLabel> {
    const labels: Array<WordLabel> = [];

    if (editor && !isExtensionPanel(editor)) {
        const visibleRanges = editor.visibleRanges;
        const document = editor.document;
        visibleRanges.forEach((visibleRange: Range | undefined) => {
            if (!visibleRange) {
                return;
            }

            const text = document.getText(visibleRange);
            const lines = text.split(/\r?\n/);
            lines.forEach((line: string, index: number) => {
                let word: any;
                while (
                    (word = env.settings.wordsPattern.exec(line)) !== null &&
                    env.keyIndex < env.keys.length
                ) {
                    const keyLabel = env.keys[env.keyIndex++]; // No mutation, just increment index

                    const column = word.index;
                    const label = new WordLabel();
                    label.settings = env.settings;
                    label.textEditor = editor;
                    label.keyLabel = keyLabel || '';
                    label.lineNumber = visibleRange.start.line + index;
                    label.column = column;
                    labels.push(label);
                }
            });
        });
    }
    return labels;
};

// Important to skip a Copilot views which contain embedded editors
function isExtensionPanel(editor: TextEditor): boolean {
    const scheme = editor.document.uri.scheme;

    return (
        // General extension panel/webview checks
        scheme === 'webview' ||
        scheme.startsWith('vscode-' /* handles co-pilot etc. */)
    );
}

export default labeler;
