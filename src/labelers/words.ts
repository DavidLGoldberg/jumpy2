import { Selection, TextEditor, window } from 'vscode';
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

    getDecoration(): any {
        const { lineNumber, column, keyLabel } = this;

        this.marker = new Range(
            new Position(lineNumber, column),
            new Position(lineNumber, column + 2)
        );

        const label = { after: { contentText: keyLabel } };
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
        }
    }
}

const labeler: Labeler = function (
    env: LabelEnvironment,
    editor: TextEditor
): Array<WordLabel> {
    const usedKeys = env.keys; // Intentionally mutate from calling env
    const labels: Array<WordLabel> = [];

    if (editor && !isExtensionPanel(editor)) {
        const visibleRanges = editor.visibleRanges;
        const document = editor.document;
        visibleRanges.forEach((visibleRange) => {
            const text = document.getText(visibleRange);
            const lines = text.split(/\r?\n/);
            lines.forEach((line, index) => {
                let word: any;
                while (
                    (word = env.settings.wordsPattern.exec(line)) !== null &&
                    usedKeys.length
                ) {
                    const keyLabel = usedKeys.shift();

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
