import { Selection, TextEditor, TextEditorRevealType, window } from 'vscode';
import { LabelEnvironment, Label, Labeler, Settings } from '../label-interface';
import { Range, Position } from 'vscode';
import getWordBeaconDecoration from './wordBeacons';

interface LabelColors {
    backgroundColor: string;
    fontColor: string;
}

const BASE_COLORS: LabelColors = {
    backgroundColor: '#00d85d',
    fontColor: '#2d3236',
};

const CHECKERED_COLORS: LabelColors = {
    backgroundColor: '#2d3236',
    fontColor: '#00d85d',
};

// --- CharacterLabel ---

class CharacterLabel implements Label {
    keyLabel!: string;
    textEditor: TextEditor | undefined;
    lineNumber!: number;
    column!: number;
    settings: Settings | undefined;
    marker!: Range;

    destroy() {}

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
                backgroundColor: colors.backgroundColor,
                color: colors.fontColor,
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

    animateBeacon() {
        if (!this.textEditor) {
            return;
        }

        const { lineNumber, column } = this;

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

function isExtensionPanel(editor: TextEditor): boolean {
    const scheme = editor.document.uri.scheme;

    if (scheme === 'vscode-test-web' || scheme === 'vscode-vfs') {
        return false;
    }

    return scheme === 'webview' || scheme.startsWith('vscode-');
}

export default labeler;
