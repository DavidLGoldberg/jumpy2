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

    drawLabel(): Label {
        const { textEditor, lineNumber, column, keyLabel } = this;

        this.marker = new Range(new Position(lineNumber,column), new Position(lineNumber, column+2));

        const editorConfig = vscode.workspace.getConfiguration('editor');

        const fontFamily = editorConfig.get<string>('fontFamily');
        const retrievedFontSize: (number | undefined) = editorConfig.get<number>('fontSize');
        const fontSize = retrievedFontSize ? retrievedFontSize : 10;
        console.log(fontSize);

        const darkDecoration = {
            fontFamily: fontFamily,
            fontSize: fontSize,
        };

        const width = fontSize; // just change this to +5
        const left = -width;

        const wordLabelDecorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: keyLabel,
                textDecoration: 'none',
                margin: `0 0 0 ${left}px`,
                height: '${fontSize}px',
                width: `${width}px`,
            },
            opacity: '0',
            light: {
                backgroundColor: 'gray'
            },
            dark: {
                backgroundColor: 'green'
            }
            ,rangeBehavior: DecorationRangeBehavior.ClosedClosed

        });

        const decoration = { range: this.marker };

        const decorations: vscode.DecorationOptions[] = [];
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

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const visibleRanges = editor.visibleRanges;
        const document = editor.document;
        const text = document.getText(visibleRanges[0]);
        const lines = text.split(/\r?\n/);
        lines.forEach((line, index) => {
            let word: any;
            while ((word = env.settings.wordsPattern.exec(line)) !== null && env.keys.length) {
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
