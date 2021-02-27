import {
    commands,
    DecorationOptions,
    ExtensionContext,
    StatusBarAlignment,
    StatusBarItem,
    ThemeColor,
    window,
    workspace,
} from 'vscode';

// @ts-ignore
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

const statusBarItem: StatusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Left,
    1000
);

let allLabels: Array<Label> = new Array<Label>();

// Subscribe:
stateMachine.ports.validKeyEntered.subscribe((keyLabel: string) => {
    // ! TODO: why is this always firing without a real key press ?
    // TODO: should I be unregistering this?
    // console.log('valid key entered', keyLabel);

    if (keyLabel) {
        _clearLabels();
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
            ? new ThemeColor('errorForeground')
            : new ThemeColor('editorInfo.foreground');

        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
});

function _renderLabels(enteredKey?: string) {
    // TODO: Clean this up a bit? Do I need to only call this once, or is it efficient / cached
    // Intentionally not using "pattern" type although it does exist.
    // It didn't facilitate adding in a regex when I tried,
    // and forced the user to leave the settings UI.
    const wordPattern: string | undefined = workspace
        .getConfiguration('jumpy2')
        .get('wordPattern');

    // TODO: another refactor to handle any "labeler" would be necessary this func ^ is too word centric atm.  As opposed to the last iteration of the Atom architecture
    if (!wordPattern) {
        return;
    }

    const environment: LabelEnvironment = {
        keys: [...keySet],
        settings: {
            wordsPattern: new RegExp(wordPattern, 'g'),
        },
    };

    allLabels.length = 0; // Clear the array from previous runs.

    window.visibleTextEditors.forEach((editor) => {
        // Atom architecture (copied here) allows for other label providers:
        const editorLabels = getWordLabels(environment, editor);
        allLabels = [...allLabels, ...editorLabels];

        const decorations: DecorationOptions[] = editorLabels
            .filter((label) =>
                enteredKey ? label.keyLabel.startsWith(enteredKey) : true
            )
            .map((label) => label.getDecoration());

        editor.setDecorations(wordLabelDecorationType, decorations);
    });
}

function enterJumpMode() {
    isJumpMode = true; // TODO: I hate this, but 'getContext' is not as straight forward
    commands.executeCommand('setContext', 'jumpy.jump-mode', true);

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
    stateMachine.ports.key.send(key.charCodeAt(0));
}

function reset() {
    stateMachine.ports.reset.send(null);
    _clearLabels();
    _renderLabels();
}

function _clearLabels() {
    window.visibleTextEditors.forEach((editor) => {
        editor.setDecorations(wordLabelDecorationType, []);
    });
}

function _clear() {
    isJumpMode = false;
    commands.executeCommand('setContext', 'jumpy.jump-mode', false);
    _clearLabels();
}

function clear() {
    stateMachine.ports.exit.send(null);
}

export function activate(context: ExtensionContext) {
    const { subscriptions } = context;
    const { registerCommand } = commands;

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

    /* NOTE: Effectively I want "all" events.  I don't think such an event exists,
    and even if it did it wouldn't be future proof. Luckily, things like command pallette,
    finds, etc...work nicely with jumpy atm, despite not clearing them.
    Instead, upon exit of these you can resume where Jumpy left off! */
    const events = [
        window.onDidChangeActiveTerminal,
        window.onDidChangeActiveTextEditor,
        window.onDidChangeTextEditorOptions,
        window.onDidChangeTextEditorSelection,
        window.onDidChangeTextEditorViewColumn,
        window.onDidChangeTextEditorVisibleRanges,
        window.onDidChangeVisibleTextEditors,
        window.onDidChangeWindowState,
        window.onDidCloseTerminal,
        window.onDidOpenTerminal,
        workspace.onDidChangeTextDocument,
        workspace.onDidOpenTextDocument,
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
