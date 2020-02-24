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
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', true);
    isJumpMode = true; // TODO: I hate this, but 'getContext' is not as straight forward

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

    // TODO: This will eventually have to be for each, or some kind of observer.
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.setDecorations(wordLabelDecorationType, decorations);
    }

    //     stateMachine.ports.key.send(key.charCodeAt());
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
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', false);

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

    // The decorations should ultimately be removed from clear above (not yet across all editors).
    // TODO: check if I should free the memory of the type here as well.
    wordLabelDecorationType.dispose();
}
