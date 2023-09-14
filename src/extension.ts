import debounce from 'lodash.debounce';

import {
    commands,
    DecorationOptions,
    extensions,
    ExtensionContext,
    window,
    workspace,
} from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';

// @ts-ignore
import elmApp from '../out/elm/StateMachineVSC';
import { LabelEnvironment, Label, Settings } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import { createStatusBar, setStatusBar } from './statusPrinter';
import { getKeySet, getAllKeys } from './keys';

let reporter: TelemetryReporter; // Instantiated on activation
let globalState: any;
const careerJumpsMadeKey = 'careerJumpsMade';

const stateMachine = elmApp.Elm.StateMachineVSC.init();

const getSettings = (): Settings => {
    return {
        // Intentionally not using "pattern" type although it does exist.
        // It didn't facilitate adding in a regex when I tried,
        // and forced the user to leave the settings UI.
        wordsPattern: new RegExp(
            <string | undefined>(
                workspace.getConfiguration('jumpy2').get('wordPattern')
            ) || '',
            'g'
        ),
        customKeys: Array.from(
            <string>workspace.getConfiguration('jumpy2').get('customKeys')
        ),
    };
};

const statusBarItem = createStatusBar();

let allLabels: Array<Label> = new Array<Label>();

// Subscribe:
stateMachine.ports.validKeyEntered.subscribe((keyLabel: string) => {
    // This also broadcasts some empty strings in some cases.  Fine to ignore them.
    if (keyLabel) {
        _clearLabels();
        _renderLabels(keyLabel);
    }
});

stateMachine.ports.labelJumped.subscribe((keyLabel: string) => {
    const foundLabel = allLabels.find((label) => label.keyLabel === keyLabel);
    if (foundLabel) {
        foundLabel.jump();
        foundLabel.animateBeacon();
        reporter.sendTelemetryEvent(`jump-${keyLabel}`);
        const currentCount = (globalState.get(careerJumpsMadeKey) || 0) + 1;
        globalState.update(careerJumpsMadeKey, currentCount);
        reporter.sendTelemetryEvent(`career-${currentCount}`);
    }
});

stateMachine.ports.activeChanged.subscribe((active: boolean) => {
    if (!active) {
        _exitDebounced();
    }
});

stateMachine.ports.statusChanged.subscribe((statusMarkup: string) => {
    setStatusBar(statusBarItem, statusMarkup);
});

function _renderLabels(enteredKey?: string) {
    // TODO: another refactor to handle any "labeler" would be necessary this func ^ is too word centric atm.  As opposed to the last iteration of the Atom architecture
    if (!getSettings().wordsPattern) {
        return;
    }

    const environment: LabelEnvironment = {
        keys: [...getKeySet(getSettings().customKeys)],
        settings: getSettings(),
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
    commands.executeCommand('setContext', 'jumpy2.jump-mode', true);

    _renderLabels();
    stateMachine.ports.getLabels.send(allLabels.map((label) => label.keyLabel));
}

function toggle() {
    reporter.sendTelemetryEvent('toggle');
    enterJumpMode();
}

function sendKey(key: string) {
    reporter.sendTelemetryEvent(`sendKey-${key}`);
    stateMachine.ports.key.send(key.charCodeAt(0));
}

function reset() {
    reporter.sendTelemetryEvent('reset');
    stateMachine.ports.reset.send(null);
    _clearLabels();
    _renderLabels();
}

function _clearLabels() {
    window.visibleTextEditors.forEach((editor) => {
        editor.setDecorations(wordLabelDecorationType, []);
    });
}

function _exit() {
    commands.executeCommand('setContext', 'jumpy2.jump-mode', false);
    _clearLabels();
}
const _exitDebounced = debounce(_exit, 350, { leading: true, trailing: false });

function exit() {
    reporter.sendTelemetryEvent('exit-requested');
    stateMachine.ports.exit.send(null);
}

function career() {
    const careerJumpsMade = (
        globalState.get(careerJumpsMadeKey) || 0
    ).toString();
    reporter.sendTelemetryEvent(`career-show-${careerJumpsMade}`);
    window.showInformationMessage(`Total career jumps: ${careerJumpsMade} 👏`);
}

export function activate(context: ExtensionContext) {
    globalState = context.globalState;
    globalState.setKeysForSync([careerJumpsMadeKey]);
    const { subscriptions } = context;
    const { registerCommand } = commands;

    const extensionId = 'DavidLGoldberg.jumpy2';
    reporter = new TelemetryReporter(
        extensionId,
        extensions.getExtension(extensionId)!.packageJSON.version, // extension version
        '618cee5c-79f0-46c5-a2ab-95f734e163ef' // app insights instrumentation key
    );
    subscriptions.push(reporter);

    reporter.sendTelemetryEvent('activate');

    subscriptions.push(
        registerCommand('jumpy2.toggle', toggle),
        registerCommand('jumpy2.reset', reset),
        registerCommand('jumpy2.exit', exit),
        registerCommand('jumpy2.career', career)
    );

    const allKeys = getAllKeys(getSettings().customKeys);
    subscriptions.concat(
        [...allKeys.lowerCharacters, ...allKeys.upperCharacters].map((chr) =>
            registerCommand(`jumpy2.${chr}`, () => sendKey(chr))
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
        window.onDidChangeTextEditorViewColumn,
        window.onDidChangeVisibleTextEditors,
        window.onDidChangeWindowState,
        window.onDidCloseTerminal,
        window.onDidOpenTerminal,
        workspace.onDidOpenTextDocument,
        // The following are too aggressive, they make the keymapping troubleshooting feature useless as jumpy clears.
        // They also probably are responsible for some of the occasional "loading" clearing/exiting I was experiencing.  I think they would conflict with for example a job being streamed on terminal
        window.onDidChangeTextEditorSelection, // need these for now unfortunately.  Comment them out if keymap troubleshooting is required
        window.onDidChangeTextEditorVisibleRanges,
        // workspace.onDidChangeTextDocument,
    ];

    subscriptions.push(...events.map((event) => event(() => _exitDebounced())));
}

export function deactivate() {
    _exit();

    statusBarItem.dispose();

    wordLabelDecorationType.dispose();
    reporter.dispose();
}
