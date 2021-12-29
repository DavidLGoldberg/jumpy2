import {
    commands,
    DecorationOptions,
    extensions,
    ExtensionContext,
    StatusBarAlignment,
    StatusBarItem,
    ThemeColor,
    window,
    workspace,
} from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';

// @ts-ignore
import elmApp from '../out/elm/StateMachineVSC';
import { LabelEnvironment, Label, Settings } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import statusPrinter from './statusPrinter';
import { getKeySet, getAllKeys } from './keys';

let reporter: TelemetryReporter;
const extensionId = 'DavidLGoldberg.jumpy2';
const extensionVersion =
    extensions.getExtension(extensionId)!.packageJSON.version;
const appInsightsInstrumentationKey = '618cee5c-79f0-46c5-a2ab-95f734e163ef';

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
        reporter.sendTelemetryEvent(`jumpy2.jump-${keyLabel}`);
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
    reporter.sendTelemetryEvent('jumpy2.toggle');
    enterJumpMode();
}

function sendKey(key: string) {
    reporter.sendTelemetryEvent(`jumpy2.sendKey-${key}`);
    stateMachine.ports.key.send(key.charCodeAt(0));
}

function reset() {
    reporter.sendTelemetryEvent('jumpy2.reset');
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
    commands.executeCommand('setContext', 'jumpy2.jump-mode', false);
    _clearLabels();
}

function clear() {
    reporter.sendTelemetryEvent('jumpy2.clear');
    stateMachine.ports.exit.send(null);
}

export function activate(context: ExtensionContext) {
    const { subscriptions } = context;
    const { registerCommand } = commands;

    reporter = new TelemetryReporter(
        extensionId,
        extensionVersion,
        appInsightsInstrumentationKey
    );
    subscriptions.push(reporter);

    reporter.sendTelemetryEvent('jumpy2.activate');

    subscriptions.push(
        registerCommand('jumpy2.toggle', toggle),
        registerCommand('jumpy2.reset', reset),
        registerCommand('jumpy2.clear', clear)
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
    reporter.dispose();
}
