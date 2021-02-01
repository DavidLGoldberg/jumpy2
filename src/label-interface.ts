import { TextEditor, DecorationOptions } from 'vscode';

export interface LabelEnvironment {
    keys: Array<string>;
    settings: any;
}

export interface Label {
    keyLabel: string;
    textEditor: TextEditor | undefined;
    settings: any;
    getDecoration(): DecorationOptions;
    animateBeacon(input: any): void;
    jump(): void;
    destroy(): void;
}

export interface Labeler {
    (environment: LabelEnvironment, editor: TextEditor): Array<Label>;
}
