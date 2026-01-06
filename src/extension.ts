import debounce from 'lodash.debounce';

import {
    commands,
    DecorationOptions,
    ExtensionContext,
    window,
    workspace,
    ViewColumn,
} from 'vscode';
import TelemetryReporter from '@vscode/extension-telemetry';

// @ts-ignore
import elmApp from '../out/elm/StateMachineVSC';
import { LabelEnvironment, Label, Settings } from './label-interface';
import getWordLabels from './labelers/words';
import {
    wordLabelBaseDecorationType,
    wordLabelCheckeredDecorationType,
} from './labelers/wordDecorations';
import { createStatusBar, setStatusBar } from './statusPrinter';
import { getKeySet, getAllKeys } from './keys';
import { achievements, achievementsWebview } from './achievements';
import { updatesWebview } from './updated';

let reporter: TelemetryReporter; // Instantiated on activation
let globalState: any;
const careerJumpsMadeKey = 'careerJumpsMade';
const previousVersionKey = 'previousVersion';

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
            'gu'
        ),
        customKeys: Array.from(
            <string>workspace.getConfiguration('jumpy2').get('customKeys')
        ),
        revealAfterJump: <Settings["revealAfterJump"]>(
            workspace.getConfiguration('jumpy2').get('revealAfterJump')
        )
    };
};

const statusBarItem = createStatusBar();

let allLabels: Array<Label> = new Array<Label>();
let isSelectionMode: boolean = false;

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
        foundLabel.jump(isSelectionMode);
        foundLabel.animateBeacon();
        const currentCount = (globalState.get(careerJumpsMadeKey) || 0) + 1;
        globalState.update(careerJumpsMadeKey, currentCount);
        reporter.sendTelemetryEvent(
            `jump${isSelectionMode ? '-selection' : '-normal'}`,
            {
                'jumpy.keysjumpedwith': keyLabel,
                'jumpy.careerjumps': currentCount.toString(),
            }
        );

        // call the `showAchievements` command here when the user has jumped n times found in the `achievements` object
        // but respect the user's desire to disable this first:
        const achievementsEnabled = workspace
            .getConfiguration('jumpy2')
            .get('achievements.active') as boolean;
        if (achievementsEnabled && currentCount in achievements) {
            commands.executeCommand('jumpy2.showAchievements');
            reporter.sendTelemetryEvent('show-achievements-triggered', {
                'jumpy.careerjumps': currentCount.toString(),
            });
        }
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

        const baseDecorations: DecorationOptions[] = [];
        const checkeredDecorations: DecorationOptions[] = [];

        editorLabels
            .filter((label) =>
                enteredKey ? label.keyLabel.startsWith(enteredKey) : true
            )
            .forEach((label, index) => {
                const decoration = label.getDecoration();
                if (index % 2 === 0) {
                    baseDecorations.push(decoration);
                } else {
                    workspace.getConfiguration('jumpy2').get('checkered.active')
                        ? checkeredDecorations.push(decoration)
                        : baseDecorations.push(decoration);
                }
            });

        editor.setDecorations(wordLabelBaseDecorationType, baseDecorations);
        editor.setDecorations(
            wordLabelCheckeredDecorationType,
            checkeredDecorations
        );
    });
}

function enterJumpMode() {
    commands.executeCommand('setContext', 'jumpy2.jump-mode', true);

    _renderLabels();
    stateMachine.ports.getLabels.send(allLabels.map((label) => label.keyLabel));
}

function toggle() {
    reporter.sendTelemetryEvent('toggle-normal');
    isSelectionMode = false;
    enterJumpMode();
}

function toggleSelection() {
    reporter.sendTelemetryEvent('toggle-selection');
    isSelectionMode = true;
    enterJumpMode();
}

function sendKey(key: string) {
    reporter.sendTelemetryEvent('key-pressed', { 'jumpy.keypressed': key });
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
        editor.setDecorations(wordLabelBaseDecorationType, []);
        editor.setDecorations(wordLabelCheckeredDecorationType, []);
    });
}

function _exit() {
    commands.executeCommand('setContext', 'jumpy2.jump-mode', false);
    _clearLabels();
}
const _exitDebounced = debounce(_exit, 350, { leading: true, trailing: false });

function exit() {
    reporter.sendTelemetryEvent('exit-manual');
    stateMachine.ports.exit.send(null);
}

function showAchievements() {
    const careerJumpsMade = (
        globalState.get(careerJumpsMadeKey) || 0
    ).toString();
    reporter.sendTelemetryEvent('show-achievements', {
        'jumpy.careerjumps': careerJumpsMade.toString(),
    });

    const panel = window.createWebviewPanel(
        'jumpy2Achievements',
        'Jumpy2 Achievements',
        ViewColumn.One,
        {
            enableScripts: false,
            retainContextWhenHidden: false, // technically probably not needed with enableScripts set to false, but leaving here in case + future proofing.
        }
    );

    panel.webview.html = achievementsWebview(careerJumpsMade);
}

export function activate(context: ExtensionContext) {
    globalState = context.globalState; // stored at a more global scope for methods without context :\
    globalState.setKeysForSync([careerJumpsMadeKey, previousVersionKey]);
    const { subscriptions } = context;
    subscriptions.push(
        statusBarItem,
        wordLabelBaseDecorationType,
        wordLabelCheckeredDecorationType
    );
    const { registerCommand } = commands;
    const currentExtensionVersion = context.extension.packageJSON.version;
    reporter = new TelemetryReporter(
        '618cee5c-79f0-46c5-a2ab-95f734e163ef' // app insights instrumentation key
    );
    subscriptions.push(reporter);

    reporter.sendTelemetryEvent('activate', {
        'jumpy.settings': JSON.stringify(workspace.getConfiguration('jumpy2')),
    });

    const previousVersion =
        context.globalState.get<string>(previousVersionKey) || '';
    if (isNotableUpdate(previousVersion, currentExtensionVersion)) {
        commands.executeCommand('jumpy2.showUpdates');
        // store latest version
        context.globalState.update(previousVersionKey, currentExtensionVersion);
        reporter.sendTelemetryEvent('show-updates-triggered'); // implicitly has version from 'common'
    }

    subscriptions.push(
        registerCommand('jumpy2.toggle', toggle),
        registerCommand('jumpy2.toggleSelection', toggleSelection),
        registerCommand('jumpy2.reset', reset),
        registerCommand('jumpy2.exit', exit),
        registerCommand('jumpy2.showAchievements', showAchievements),
        registerCommand('jumpy2.showUpdates', showUpdates)
    );

    const allKeys = getAllKeys(getSettings().customKeys);
    subscriptions.push(
        ...[...allKeys.lowerCharacters, ...allKeys.upperCharacters].map((chr) =>
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
    // NOTE: subscriptions will automatically be disposed of
}

// Version check code and above with global accessor inspired by the following.
// https://stackoverflow.com/a/66307695/89682
// The extension's code: https://github.com/GorvGoyl/Shortcut-Menu-Bar-VSCode-Extension/blob/master/src/extension.ts.
// https://marketplace.visualstudio.com/items?itemName=jerrygoyal.shortcut-menu-bar (cool extension!)
function isNotableUpdate(previousVersion: string, currentVersion: string) {
    if (previousVersion.indexOf('.') === -1) {
        return true;
    }

    const [previousMajor, previousMinor, previousPatch] = previousVersion
        .split('.')
        .map(Number);
    const [currentMajor, currentMinor, currentPatch] = currentVersion
        .split('.')
        .map(Number);

    return currentMajor > previousMajor || currentMinor > previousMinor;
}

function showUpdates() {
    reporter.sendTelemetryEvent('show-updates');

    const panel = window.createWebviewPanel(
        'jumpy2Updates',
        'Jumpy2 Updates',
        ViewColumn.One,
        {
            enableScripts: false,
            retainContextWhenHidden: false, // technically probably not needed with enableScripts set to false, but leaving here in case + future proofing.
        }
    );

    panel.webview.html = updatesWebview();
}
