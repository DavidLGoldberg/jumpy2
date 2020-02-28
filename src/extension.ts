import * as vscode from 'vscode';
import * as _ from 'lodash';
// @ts-ignore
// import * as elmApp from './elm/StateMachine';
import * as elmApp from '../out/elm/StateMachineAtom';
import { LabelEnvironment, Label } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import labelReducer from './label-reducer';
import { getKeySet, getAllKeys } from './keys';

const stateMachine = elmApp.Elm.StateMachineAtom.init();
let isJumpMode = false; // TODO: change with state machine i guess.

const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10
);

// Subscribe:
stateMachine.ports.validKeyEntered.subscribe((keyLabel: string) => {
    console.log('valid key entered', keyLabel);
    // for (const label of drawnLabels) {
    //     if (!label.keyLabel || !label.element) {
    //         continue;
    //     }
    //     if (!label.keyLabel.startsWith(keyLabel)) {
    //         label.element.classList.add('irrelevant');
    //     }
    // }

    // currentLabels = labelReducer(currentLabels, keyLabel);
});

// stateMachine.ports.labelJumped.subscribe((keyLabel: string) => {
//     // TODO: change this to get rid of lodash in this file!
//     _.find(currentLabels, label => label.keyLabel === keyLabel).jump();
// });

// Why did I ever have this? I can probably remove it...Maybe it was sort of an ack back for race conditions...
// stateMachine.ports.activeChanged.subscribe((active: boolean) => {
//     this.active = active;

//     if (!this.active) {
//         this.turnOffListeners();
//         this.clearJumpMode();
//     }
// });

stateMachine.ports.statusChanged.subscribe((statusMarkup: string) => {
    if (statusMarkup) {
        statusBarItem.text = statusMarkup;
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
    console.log(statusMarkup);
});

function enterJumpMode() {
    isJumpMode = true; // TODO: I hate this, but 'getContext' is not as straight forward
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', true);

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
}

function toggle() {
    if (!isJumpMode) {
        enterJumpMode();
    } else {
        clear();
    }
}

function handleKey(key: string) {
    console.log(key);
    stateMachine.ports.key.send(key.charCodeAt(0));
}

function reset() {
    console.log('reset is called');
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

    const { lowerCharacters, upperCharacters } = getAllKeys([]);
    context.subscriptions.concat(
        lowerCharacters
            .concat(upperCharacters)
            .map(chr => registerCommand('jumpy.' + chr, () => handleKey(chr)))
    );
}

export function deactivate() {
    clear();

    // The decorations should ultimately be removed from clear above (not yet across all editors).
    // TODO: check if I should free the memory of the type here as well.
    wordLabelDecorationType.dispose();
}
