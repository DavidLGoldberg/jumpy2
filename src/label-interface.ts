import { TextEditor, DecorationOptions } from 'vscode';

export interface Settings {
    wordsPattern: RegExp;
    customKeys: ReadonlyArray<string>;
}

export interface LabelEnvironment {
    keys: Array<string>;
    settings: Settings;
}

export interface Label {
    keyLabel: string;
    textEditor: TextEditor | undefined;
    settings: Settings | undefined;
    getDecoration(): DecorationOptions;
    animateBeacon(input: any): void;
    jump(): void;
    destroy(): void;
}

export interface Labeler {
    (environment: LabelEnvironment, editor: TextEditor): Array<Label>;
}
