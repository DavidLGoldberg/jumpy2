import * as vscode from 'vscode';

export interface LabelEnvironment {
    keys: Array<string>;
    settings: any;
}

export interface Label {
    keyLabel: string;
    textEditor: vscode.TextEditor | undefined;
    settings: any;
    drawLabel(): Label;
    animateBeacon(input: any): void;
    jump(): void;
    destroy(): void;
}

export interface Labeler {
    (environment: LabelEnvironment): Array<Label>;
}
