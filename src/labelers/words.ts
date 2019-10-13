'use babel';

import * as vscode from 'vscode';
import { LabelEnvironment, Label, Labeler } from '../label-interface';
import { Range, Position } from 'vscode';

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

    drawLabel(): Label {
        const { textEditor, lineNumber, column, keyLabel } = this;

        this.marker = new Range(new Position(lineNumber,column), new Position(lineNumber,column+2));

        const wordLabelDecorationType = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            overviewRulerColor: 'blue',
            light: {
                // this color will be used in light color themes
                borderColor: 'darkblue'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'lightblue'
            }
        });

        const decorations: vscode.DecorationOptions[] = [];

        const decoration = { range: this.marker, hoverMessage: keyLabel };
        decorations.push(decoration);

        if (textEditor) {
            textEditor.setDecorations(wordLabelDecorationType, decorations);
        }

        return this;
    }

    animateBeacon() {
    }

    jump() {
    }
}


const labeler: Labeler = function(env:LabelEnvironment):Array<WordLabel> {
    const labels:Array<WordLabel> = [];

    const label = new WordLabel();
    label.settings = env.settings;
    label.keyLabel = 'aa';
    label.lineNumber = 0;
    label.column = 0;
    label.textEditor = vscode.window.activeTextEditor;
    labels.push(label);

    return labels;
};

export default labeler;
