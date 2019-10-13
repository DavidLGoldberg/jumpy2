'use babel';

import * as vscode from 'vscode';
import { LabelEnvironment, Label, Labeler } from '../label-interface';
// import { TextEditor, Pane } from 'atom';

class WordLabel implements Label {
    // TODO: check I need these defined again?
    keyLabel!: string;
    textEditor: vscode.TextEditor | undefined;
    lineNumber!: number;
    column!: number;
    // element: HTMLElement | null;
    settings: any;

    destroy() {
        // if (this.element) {
        //     this.element.remove();
        // }
    }

    drawLabel(): Label {
        const { textEditor, lineNumber, column, keyLabel } = this;

        // this.marker = textEditor.markScreenRange(new Range(
        //     new Point(lineNumber, column),
        //     new Point(lineNumber, column)),
        //     { invalidate: 'touch'});

        // const labelElement = document.createElement('div');
        // labelElement.textContent = keyLabel;
        // labelElement.style.fontSize = this.settings.fontSize;
        // labelElement.classList.add('jumpy-label'); // For styling and tests

        // if (this.settings.highContrast) {
        //    labelElement.classList.add('high-contrast');
        // }

        // const decoration = textEditor.decorateMarker(this.marker,
        //     {
        //         type: 'overlay',
        //         item: labelElement,
        //         position: 'head'
        //     });
        // this.element = labelElement;
        // return this;


        return this;
    }

    animateBeacon() {
        // // TODO: abstract function to find Word!
        // const tabsPane:Pane = atom.workspace.paneForItem(this.textEditor);
        // const tabsPaneElement:HTMLElement = atom.views.getView(tabsPane);
        // const foundTab:HTMLElement | null = <HTMLElement>tabsPaneElement
        //     .querySelector(`[data-path='${this.textEditor.getPath()}'`);

        // if (foundTab) {
        //     const beacon = document.createElement('span');
        //     beacon.style.position = 'relative';
        //     beacon.style.zIndex = '4';
        //     beacon.classList.add('beacon'); // For styling and tests
        //     beacon.classList.add('tab-beacon');

        //     foundTab.appendChild(beacon);
        //     setTimeout(function() {
        //         beacon.remove();
        //     } , 150);
        // }
    }

    jump() {
        // const pane = atom.workspace.paneForItem(this.textEditor);
        // pane.activate();
        // pane.activateItem(this.textEditor);

        // if (atom.config.get('jumpy.useHomingBeaconEffectOnJumps')) {
        //     this.animateBeacon();
        // }
    }
}


const labeler: Labeler = function(env:LabelEnvironment):Array<WordLabel> {
    const labels:Array<WordLabel> = [];

    const label = new WordLabel();
    label.settings = env.settings;
    label.keyLabel = 'aa';
    label.lineNumber = 1;
    label.column = 1;
    label.textEditor = vscode.window.activeTextEditor;
    labels.push(label);

    return labels;
};

export default labeler;
