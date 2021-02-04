import * as vscode from 'vscode';

// @ts-ignore
// import * as elmApp from './elm/StateMachineVSC';
import * as elmApp from '../out/elm/StateMachineVSC';
import { LabelEnvironment, Label } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import statusPrinter from './statusPrinter';
import { getKeySet, getAllKeys } from './keys';

const stateMachine = elmApp.Elm.StateMachineVSC.init();
let isJumpMode = false; // TODO: change with state machine i guess.

//TODO: get custom keys from settings / config
// keys: getKeySet(atom.config.get('jumpy.customKeys')),
const keySet = getKeySet([]);
const allKeys = getAllKeys([]);

const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    1000
);

// This is GROSS but ...YOLO.
// This is a global, deal with it.
declare var allLabels: Array<Label>;
// TODO: Can I just move this down below instead of the clear array?
// @ts-ignore
globalThis.allLabels = Array<Label>();

// Subscribe:
stateMachine.ports.validKeyEntered.subscribe((keyLabel: string) => {
    // ! TODO: why is this always firing without a real key press ?
    // TODO: should I be unregistering this?
    // This is only here for the label reducer right?
    console.log('valid key entered', keyLabel);

    if (keyLabel) {
        _renderLabels(keyLabel);
    }
});

stateMachine.ports.labelJumped.subscribe((keyLabel: string) => {
    const foundLabel = allLabels.find((label) => label.keyLabel === keyLabel);
    if (foundLabel) {
        foundLabel.jump();
    }
});

stateMachine.ports.activeChanged.subscribe((active: boolean) => {
    if (!active) {
        _clear();
    }
});

stateMachine.ports.statusChanged.subscribe((statusMarkup: string) => {
    if (statusMarkup) {
        statusBarItem.text = statusPrinter(statusMarkup);

        statusBarItem.color = statusMarkup.includes('No Match')
            ? new vscode.ThemeColor('errorForeground')
            : new vscode.ThemeColor('editorInfo.foreground');

        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
});

function _renderLabels(enteredKey?: string) {
    const environment: LabelEnvironment = {
        keys: [...keySet],
        settings: {
            //TODO: get match from settings / config
            wordsPattern: new RegExp('([A-Z]+([0-9a-z])*)|[a-z0-9]{2,}', 'g'),
        },
    };

    allLabels.length = 0; // Clear the array from previous runs.

    vscode.window.visibleTextEditors.forEach((editor) => {
        // Atom architecture (copied here) allows for other label providers:
        const editorLabels = getWordLabels(environment, editor);
        allLabels = [...allLabels, ...editorLabels];

        const decorations: vscode.DecorationOptions[] = editorLabels
            .filter((label) =>
                enteredKey ? label.keyLabel.startsWith(enteredKey) : true
            )
            .map((label) => label.getDecoration());

        editor.setDecorations(wordLabelDecorationType, decorations);
    });
}

function enterJumpMode() {
    isJumpMode = true; // TODO: I hate this, but 'getContext' is not as straight forward
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', true);

    _renderLabels();
    stateMachine.ports.getLabels.send(allLabels.map((label) => label.keyLabel));
}

function toggle() {
    if (!isJumpMode) {
        enterJumpMode();
    } else {
        clear();
    }
}

function sendKey(key: string) {
    _clearLabels(); // Might be smoother if moved back in key press only
    stateMachine.ports.key.send(key.charCodeAt(0));
}

function reset() {
    stateMachine.ports.reset.send(null);
    _clearLabels();
    _renderLabels();
}

function _clearLabels() {
    vscode.window.visibleTextEditors.forEach((editor) => {
        editor.setDecorations(wordLabelDecorationType, []);
    });
}

function _clear() {
    isJumpMode = false;
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', false);
    _clearLabels();
}

function clear() {
    stateMachine.ports.exit.send(null);
}

export function activate(context: vscode.ExtensionContext) {
    const { subscriptions } = context;
    const { registerCommand } = vscode.commands;

    subscriptions.push(
        registerCommand('jumpy.toggle', toggle),
        registerCommand('jumpy.reset', reset),
        registerCommand('jumpy.clear', clear)
    );

    subscriptions.concat(
        [...allKeys.lowerCharacters, ...allKeys.upperCharacters].map((chr) =>
            registerCommand(`jumpy.${chr}`, () => sendKey(chr))
        )
    );

    const events = [
        vscode.window.onDidChangeActiveTerminal,
        vscode.window.onDidChangeActiveTextEditor,
        vscode.window.onDidChangeTextEditorOptions,
        vscode.window.onDidChangeTextEditorSelection,
        vscode.window.onDidChangeTextEditorViewColumn,
        vscode.window.onDidChangeTextEditorVisibleRanges,
        vscode.window.onDidChangeVisibleTextEditors,
        vscode.window.onDidChangeWindowState,
        vscode.window.onDidCloseTerminal,
        vscode.window.onDidOpenTerminal,
        vscode.workspace.onDidChangeTextDocument,
        vscode.workspace.onDidOpenTextDocument,
    ];

    subscriptions.push(...events.map((event) => event(() => clear())));
}

export function deactivate() {
    _clear();

    statusBarItem.dispose();

    // The decorations should ultimately be removed from clear above (not yet across all editors).
    // TODO: check if I should free the memory of the type here as well.
    wordLabelDecorationType.dispose();
}
