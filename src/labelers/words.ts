'use babel';

import * as vscode from 'vscode';
import { LabelEnvironment, Label, Labeler } from '../label-interface';
import { Range, Position, DecorationRangeBehavior } from 'vscode';

class WordLabel implements Label {
    keyLabel!: string;
    textEditor: vscode.TextEditor | undefined;
    lineNumber!: number;
    column!: number;
    settings: any;
    marker!: vscode.Range;

    destroy() {
        // if (this.element) {
        //     this.element.remove();
        // }
    }

    getDecoration(): any {
        const { lineNumber, column, keyLabel } = this;

        this.marker = new Range(
            new Position(lineNumber, column),
            new Position(lineNumber, column + 2)
        );

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

    jump() {}
}

const labeler: Labeler = function(env: LabelEnvironment): Array<WordLabel> {
    const labels: Array<WordLabel> = [];

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const visibleRanges = editor.visibleRanges;
        const document = editor.document;
        const text = document.getText(visibleRanges[0]);
        const lines = text.split(/\r?\n/);
        lines.forEach((line, index) => {
            let word: any;
            while (
                (word = env.settings.wordsPattern.exec(line)) !== null &&
                env.keys.length
            ) {
                const keyLabel = env.keys.shift();

                const column = word.index;
                const label = new WordLabel();
                label.settings = env.settings;
                label.textEditor = editor;
                label.keyLabel = keyLabel || 'foo';
                label.lineNumber = index;
                label.column = column;
                labels.push(label);
            }
        });
    }
    return labels;
};

export default labeler;
