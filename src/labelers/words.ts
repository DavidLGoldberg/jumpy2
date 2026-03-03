import { TextEditor, ThemeColor } from 'vscode';
import { LabelEnvironment, Labeler } from '../label-interface';
import { Range, Position } from 'vscode';
import { BaseLabel, isExtensionPanel } from './BaseLabel';

const BASE_COLORS = {
    backgroundColor: new ThemeColor('jumpy2.labelBackgroundColor'),
    color: new ThemeColor('jumpy2.labelFontColor'),
    borderColor: new ThemeColor('jumpy2.labelBorderColor'),
};
const CHECKERED_COLORS = {
    backgroundColor: new ThemeColor('jumpy2.checkered_labelBackgroundColor'),
    color: new ThemeColor('jumpy2.checkered_labelFontColor'),
    borderColor: new ThemeColor('jumpy2.checkered_labelBorderColor'),
};

const borderWidth = '0.0375em';
const width = '1.265em';

class WordLabel extends BaseLabel {
    // CJK (Chinese, Japanese, Korean) and emoji characters are typically rendered as
    // double-width in monospace fonts.
    private isWideCharacter(char: string): boolean {
        // CJK Unified Ideographs, Hiragana, Katakana, Hangul, fullwidth chars, emojis
        return /[\u3000-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF]|\p{Extended_Pictographic}/u.test(
            char
        );
    }

    getDecoration(isCheckered: boolean = false): any {
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
        const baseMargin = isWide ? 1.0 : 1.265;
        const colors = isCheckered ? CHECKERED_COLORS : BASE_COLORS;

        const label = {
            after: {
                contentText: keyLabel,
                ...colors,
                margin: `-${borderWidth} 0 0 -${baseMargin}em`,
                width,
                fontWeight: 'bold',
                fontStyle: 'normal',
                border: `${borderWidth} solid`,
            },
        };
        const decoration = {
            range: this.marker,
            renderOptions: { dark: label, light: label },
        };

        return decoration;
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

export default labeler;
