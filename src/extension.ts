import * as vscode from 'vscode';
// @ts-ignore
// import * as elmApp from './elm/StateMachine';
import * as elmApp from '../out/elm/StateMachine';
import { LabelEnvironment, Label } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import * as _ from 'lodash';
import { getKeySet } from './keys';

const stateMachine = elmApp.Elm.StateMachine.init();
let isJumpMode = false; // TODO: change with state machine i guess.

function enterJumpMode() {
    isJumpMode = true;
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
    // Atom architecture (copied here) allows for other label providers:
    const allLabels: Array<Label> = [...wordLabels];
    stateMachine.ports.getLabels.send(
        allLabels
            // TODO: make sure if this line makes sense here.
            // .filter(label => label.keyLabel) // ie. tabs open after limit reached
            .map(label => label.keyLabel)
    );

    const decorations: vscode.DecorationOptions[] = allLabels.map(label =>
        label.getDecoration()
    );

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.setDecorations(wordLabelDecorationType, decorations);
    }

    // if (/^Key[A-Z]{1}$/.test(code)) {
    //     event.preventDefault();
    //     event.stopPropagation();
    //     stateMachine.ports.key.send(key.charCodeAt());
    // }
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', true);
}

function toggle() {
    if (!isJumpMode) {
        enterJumpMode();
    } else {
        clear();
    }
}

function reset() {
    stateMachine.ports.reset.send(null);
}

function clear() {
    isJumpMode = false;
    const editor = vscode.window.activeTextEditor;
    // TODO: change for each editors
    if (editor) {
        editor.setDecorations(wordLabelDecorationType, []);
    }
    stateMachine.ports.exit.send(null);
}

export function activate(context: vscode.ExtensionContext) {
    const registerCommand = vscode.commands.registerCommand;
    context.subscriptions.push(
        registerCommand('jumpy.toggle', toggle),
        registerCommand('jumpy.reset', reset),
        registerCommand('jumpy.clear', clear)
    );
}

export function deactivate() {
    clear();
}
