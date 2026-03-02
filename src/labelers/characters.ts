import { TextEditor, ThemeColor } from 'vscode';
import { LabelEnvironment, Labeler } from '../label-interface';
import { Range, Position } from 'vscode';
import { BaseLabel, isExtensionPanel } from './BaseLabel';

const BASE_COLORS = {
    backgroundColor: new ThemeColor('jumpy2.labelBackgroundColor'),
    color: new ThemeColor('jumpy2.labelFontColor'),
};

const CHECKERED_COLORS = {
    backgroundColor: new ThemeColor('jumpy2.checkered_labelBackgroundColor'),
    color: new ThemeColor('jumpy2.checkered_labelFontColor'),
};

// --- CharacterLabel ---

class CharacterLabel extends BaseLabel {
    getDecoration(isCheckered: boolean = false): any {
        const { lineNumber, column, keyLabel } = this;

        // Range covers just 1 character
        this.marker = new Range(
            new Position(lineNumber, column),
            new Position(lineNumber, column + 1)
        );

        const colors = isCheckered ? CHECKERED_COLORS : BASE_COLORS;

        const label = {
            after: {
                contentText: keyLabel,
                ...colors,
                fontWeight: 'normal',
                width: '1.40em', // derived: (1.265 - 0.075) / 2 / 0.44 ≈ 1.35; compensates for font-size: 44% --> Had to change to --> // ~0.616 editor em per label; slightly over 1ch to eliminate gaps between adjacent labels
                margin: '0 0 0 -1.40em', // MUST match width to avoid jitter and code/decoration movement (net layout impact = width - |margin| = 0)
                textDecoration: `none;
                    font-size: 44%;
                    padding: 0;
                    border: none;
                    box-sizing: border-box;
                    line-height: 0.9em;
                    vertical-align: middle;
                    text-align: center;
                    overflow: hidden;
                    transform: scaleY(1.4);`,
            },
        };
        const decoration = {
            range: this.marker,
            renderOptions: { dark: label, light: label },
        };

        return decoration;
    }
}

// --- Labeler ---

const labeler: Labeler = function (
    env: LabelEnvironment,
    editor: TextEditor
): Array<CharacterLabel> {
    const labels: Array<CharacterLabel> = [];

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
                // Label every non-whitespace character
                for (let col = 0; col < line.length; col++) {
                    const char = line[col];
                    // Skip whitespace
                    if (/\s/.test(char)) {
                        continue;
                    }

                    if (env.keyIndex >= env.keys.length) {
                        return;
                    }

                    const keyLabel = env.keys[env.keyIndex++];
                    const label = new CharacterLabel();
                    label.settings = env.settings;
                    label.textEditor = editor;
                    label.keyLabel = keyLabel || '';
                    label.lineNumber = visibleRange.start.line + index;
                    label.column = col;
                    labels.push(label);
                }
            });
        });
    }
    return labels;
};

export default labeler;
