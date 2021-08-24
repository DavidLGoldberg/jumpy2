import debounce from 'lodash.debounce';

import {
    commands,
    DecorationOptions,
    extensions,
    ExtensionContext,
    Uri,
    window,
    workspace,
} from 'vscode';
import { Range, Position } from 'vscode';

import TelemetryReporter from 'vscode-extension-telemetry';

// @ts-ignore
import elmApp from '../out/elm/StateMachineVSC';
import { LabelEnvironment, Label, Settings } from './label-interface';
import getWordLabels from './labelers/words';
import wordLabelDecorationType from './labelers/wordDecorations';
import { createStatusBar, setStatusBar } from './statusPrinter';
import { getKeySet, getAllKeys } from './keys';

let reporter: TelemetryReporter; // Instantiated on activation

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
        reporter.sendTelemetryEvent(`jump-${keyLabel}`);
        foundLabel.jump();
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

    function drawBigSvg(labels: Label[]): DecorationOptions[] {
        console.log('??????? hereeeeeee?');
        const bgColor = 'red';
        const fgColor = 'blue';
        const totalWidth = 400;
        const totalHeight = 800;
        const width = 20;
        const fontHeight = 10;
        const fontFamily = '';
        console.log('???????', labels);
        let svg =
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" style="fill: ${bgColor};">
        ${labels.map(
            (l: Label) =>
                `<rect width="${width}" height="${fontHeight}" width=${width} rx="2" ry="2" style="fill: ${bgColor};"/>
                <text
                    font-family="${fontFamily}"
                    font-size="${fontHeight}px"
                    textLength="${width - 2}"
                    textAdjust="spacing"
                    fill="${fgColor}"
                    x="1"
                    y="${fontHeight - 2}"
                    alignment-baseline="baseline">
                    ${l.keyLabel}
                </text>
                `
        )}
        </svg>`.replaceAll('\n', '');
        // svg = `<svg></svg>`;
        console.log('??????? svg?', svg.substr(0, 2000));
        // </text></svg>`.replaceAll('\n', '');

        // const label = { after: { contentText: keyLabel } };
        const label = {
            after: {
                contentIconPath: Uri.parse(`data:image/svg+xml;utf8,${svg}`),
            },
        };
        return [
            {
                range: new Range(new Position(0, 0), new Position(50, 50)),
                renderOptions: { dark: label, light: label },
            },
        ];
    }

    window.visibleTextEditors.forEach((editor) => {
        // Atom architecture (copied here) allows for other label providers:
        const editorLabels = getWordLabels(environment, editor);
        allLabels = [...allLabels, ...editorLabels];

        const bigSvg: DecorationOptions[] = drawBigSvg(
            editorLabels.filter((label) =>
                enteredKey ? label.keyLabel.startsWith(enteredKey) : true
            )
        );

        editor.setDecorations(wordLabelDecorationType, bigSvg);
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
        //
        // const marker = new Range(new Position(0, 0), new Position(0, 0));
        // const label = { after: { contentText: keyLabel } };
        // const decoration = {
        //     range: marker,
        //     renderOptions: { dark: label, light: label },
        // };
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

export function activate(context: ExtensionContext) {
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
        registerCommand('jumpy2.exit', exit)
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

    subscriptions.push(...events.map((event) => event(() => _exitDebounced())));
}

export function deactivate() {
    _exit();

    statusBarItem.dispose();

    wordLabelDecorationType.dispose();
    reporter.dispose();
}
