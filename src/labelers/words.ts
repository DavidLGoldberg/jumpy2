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

    animateBeacon(input: any) {
        if (this.textEditor === undefined) return;
        const { lineNumber, column } = this;
        const beaconMarker = new Range(lineNumber, column, lineNumber, column);
        const decoration = getWordBeaconDecoration();
        setTimeout(() => { decoration.dispose(); }, 150);
        this.textEditor.setDecorations(decoration, [beaconMarker]);
    }

    async jump() {
        if (this.textEditor) {
            if (this.textEditor !== window.activeTextEditor) {
                await window.showTextDocument(this.textEditor.document.uri, {
                    preview: false,
                    viewColumn: this.textEditor.viewColumn,
                });
            }
            this.textEditor.selection = new Selection(
                this.lineNumber,
                this.column,
                this.lineNumber,
                this.column
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

    if (editor) {
        const visibleRanges = editor.visibleRanges;
        const document = editor.document;
        visibleRanges.forEach((range) => {
            const text = document.getText(range);
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
                    label.lineNumber = range.start.line + index;
                    label.column = column;
                    labels.push(label);
                }
            });
        });
    }
    return labels;
};

export default labeler;
