import { Selection, TextEditor, TextEditorRevealType, window } from 'vscode';
import { Label, Settings } from '../label-interface';
import { Range, Position } from 'vscode';
import getWordBeaconDecoration from './wordBeacons';

export abstract class BaseLabel implements Label {
    keyLabel!: string;
    textEditor: TextEditor | undefined;
    lineNumber!: number;
    column!: number;
    settings: Settings | undefined;
    marker!: Range;

    destroy() {}

    abstract getDecoration(isCheckered?: boolean): any;

    animateBeacon() {
        if (!this.textEditor) {
            return;
        }

        const { lineNumber, column } = this;

        const beaconMarker = new Range(
            lineNumber,
            column,
            lineNumber,
            column + 1
        );
        const decoration = getWordBeaconDecoration();
        setTimeout(() => {
            decoration.dispose();
        }, 400);
        this.textEditor.setDecorations(decoration, [beaconMarker]);
    }

    async jump(isSelectionMode: boolean) {
        if (this.textEditor) {
            if (this.textEditor !== window.activeTextEditor) {
                await window.showTextDocument(this.textEditor.document.uri, {
                    preview: false,
                    viewColumn: this.textEditor.viewColumn,
                });
            }
            const newActive = new Position(this.lineNumber, this.column);
            this.textEditor.selection = new Selection(
                isSelectionMode ? this.textEditor.selection.anchor : newActive,
                newActive
            );
            if (this.settings?.revealAfterJump) {
                const revealType = {
                    minscroll: TextEditorRevealType.Default,
                    center: TextEditorRevealType.InCenter,
                    attop: TextEditorRevealType.AtTop,
                }[this.settings.revealAfterJump];
                this.textEditor.revealRange(
                    new Range(newActive, newActive),
                    revealType
                );
            }
        }
    }
}

// Important to skip Copilot views which contain embedded editors
export function isExtensionPanel(editor: TextEditor): boolean {
    const scheme = editor.document.uri.scheme;

    // Allow vscode-test-web (browser testing) and vscode-vfs (github.dev/vscode.dev)
    if (scheme === 'vscode-test-web' || scheme === 'vscode-vfs') {
        return false;
    }

    return (
        // General extension panel/webview checks
        scheme === 'webview' ||
        scheme.startsWith('vscode-' /* handles co-pilot etc. */)
    );
}
