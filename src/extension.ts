import * as vscode from 'vscode';
import { LabelEnvironment, Label } from './label-interface';
import getWordLabels from './labelers/words';
import * as _ from 'lodash';
import { getKeySet } from './keys';

function getWidth() {
    const editorConfig = vscode.workspace.getConfiguration('editor', null);
    const retrievedFontSize: number | undefined = editorConfig.get<number>(
        'fontSize'
    );
    const fontSize = retrievedFontSize ? retrievedFontSize : 10;
    return fontSize;
}

const width = getWidth();

const wordLabelDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
        textDecoration: 'none',
        margin: `0 0 0 ${-width}px`,
        width: `${width}px`,
    },
    opacity: '0',
    light: {
        backgroundColor: 'gray',
    },
    dark: {
        backgroundColor: 'green',
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});

function main() {
    const environment: LabelEnvironment = {
        // keys: getKeySet(atom.config.get('jumpy.customKeys')),
        //TODO: get custom keys from settings / config
        keys: getKeySet([]),
        settings: {
            //TODO: get match from settings / config
            wordsPattern: new RegExp('([A-Z]+([0-9a-z])*)|[a-z0-9]{2,}', 'g'),
        },
    };

    const wordLabels: Array<Label> = getWordLabels(environment);

    const allLabels: Array<Label> = [...wordLabels];

    const drawnLabels: Array<Label> = [];
    // let currentLabels:Array<Label> = [];

    const decorations: any[] = [];
    for (const label of allLabels) {
        // drawnLabels.push(label.getDecoration());
        decorations.push(label.getDecoration());
    }
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.setDecorations(wordLabelDecorationType, decorations);
    }

    // currentLabels = _.clone(allLabels);
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'extension.jumpy-vscode',
        main
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
