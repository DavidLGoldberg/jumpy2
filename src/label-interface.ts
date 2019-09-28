import * as vscode from 'vscode';

export interface LabelEnvironment {
    keys: Array<string>;
    settings: any;
}

export interface Label {
    // TODO: can I make this | null instead of undefined?
    keyLabel: string | undefined;
    textEditor: vscode.TextEditor | undefined;
    // element: any; // TODO: add back in HTMLElement
    settings: any;
    drawLabel(): Label;
    animateBeacon(input: any): void;
    jump(): void;
    destroy(): void;
}

export interface Labeler {
    (environment:LabelEnvironment):Array<Label>;
}
