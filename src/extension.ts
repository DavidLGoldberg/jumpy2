import * as vscode from 'vscode';

// @ts-ignore
// import * as elmApp from './elm/StateMachineVSC';
import * as elmApp from '../out/elm/StateMachineVSC';
import { LabelEnvironment, Label } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import labelReducer from './label-reducer';
import statusPrinter from './statusPrinter';
import { getKeySet, getAllKeys } from './keys';

const stateMachine = elmApp.Elm.StateMachineVSC.init();
let isJumpMode = false; // TODO: change with state machine i guess.

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

    // ---------------------------------------------------------------------
    // TODO: I still need to do this (irrelevant label cleanup) ------------
    // for (const label of drawnLabels) {
    //     if (!label.keyLabel || !label.element) {
    //         continue;
    //     }
    //     if (!label.keyLabel.startsWith(keyLabel)) {
    //         label.element.classList.add('irrelevant');
    //     }
    // }

    // currentLabels = labelReducer(currentLabels, keyLabel);
    // ---------------------------------------------------------------------
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

    allLabels.length = 0; // Clear the array from previous runs.

    const editors = vscode.window.visibleTextEditors;

    editors.forEach((editor) => {
        // Atom architecture (copied here) allows for other label providers:
        allLabels = [...allLabels, ...getWordLabels(environment, editor)];
        stateMachine.ports.getLabels.send(
            allLabels.map((label) => label.keyLabel)
        );

        const decorations: vscode.DecorationOptions[] = allLabels.map((label) =>
            label.getDecoration()
        );

        editor.setDecorations(wordLabelDecorationType, decorations);
    });
}

function toggle() {
    if (!isJumpMode) {
        enterJumpMode();
    } else {
        clear();
    }
}

function sendKey(key: string) {
    stateMachine.ports.key.send(key.charCodeAt(0));
}

function reset() {
    stateMachine.ports.reset.send(null);
}

function _clear() {
    isJumpMode = false;
    vscode.commands.executeCommand('setContext', 'jumpy.jump-mode', false);

    const editors = vscode.window.visibleTextEditors;
    editors.forEach((editor) => {
        if (editor) {
            editor.setDecorations(wordLabelDecorationType, []);
        }
    });
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

    const { lowerCharacters, upperCharacters } = getAllKeys([]);
    // ! TODO: I need to get this to send key only when jumpy is open duh!!!
    // ! right now at least broken when things like cmd+p ruin focus etc.
    subscriptions.concat(
        lowerCharacters
            .concat(upperCharacters)
            .map((chr) => registerCommand('jumpy.' + chr, () => sendKey(chr)))
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
