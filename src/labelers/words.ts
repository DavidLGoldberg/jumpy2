import * as vscode from 'vscode';
import { LabelEnvironment, Label, Labeler } from '../label-interface';
import { Range, Position } from 'vscode';

class WordLabel implements Label {
    keyLabel!: string;
    textEditor: vscode.TextEditor | undefined;
    lineNumber!: number;
    column!: number;
    settings: any;
    marker!: Range;

    destroy() {}

    getDecoration(): any {
        const { lineNumber, column, keyLabel } = this;

        this.marker = new Range(
            new Position(lineNumber, column),
            new Position(lineNumber, column + 2)
        );

        // TODO: TEST! Do I need a light mode? (probably)
        const decoration = {
            range: this.marker,
            renderOptions: {
                dark: {
                    after: {
                        contentText: keyLabel,
                    },
                },
            },
        };

        return decoration;
    }

    animateBeacon() {}

    async jump() {
        if (this.textEditor) {
            if (this.textEditor !== vscode.window.activeTextEditor) {
                await vscode.window.showTextDocument(
                    this.textEditor.document.uri,
                    {
                        preview: false,
                        viewColumn: this.textEditor.viewColumn,
                    }
                );
            }
            this.textEditor.selection = new vscode.Selection(
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
    editor: vscode.TextEditor
): Array<WordLabel> {
    const usedKeys = env.keys; // Intentionally mutate from calling env
    const labels: Array<WordLabel> = [];

    if (editor) {
        const visibleRanges = editor.visibleRanges;
        const document = editor.document;
        const text = document.getText(visibleRanges[0]);
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
                label.lineNumber = index;
                label.column = column;
                labels.push(label);
            }
        });
    }
    return labels;
};

export default labeler;
