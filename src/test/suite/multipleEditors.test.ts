import * as path from 'path';
import * as assert from 'assert';
import { after, afterEach, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';

const ONE_MIN = 60000;
const QUARTER_SECOND = 250;

async function wait(timeout = QUARTER_SECOND): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_text.md'
);

suite('Multiple editor test Suite', function () {
    this.timeout(ONE_MIN);
    before(async function () {
        window.showInformationMessage('Start multiple editor tests.');

        await commands.executeCommand('workbench.action.zoomReset');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);

        // NOTE: ******************** split editor right for these tests!
        await commands.executeCommand('workbench.action.splitEditorRight');

        await wait();
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        await commands.executeCommand('workbench.action.zoomIn');
        await commands.executeCommand('workbench.action.zoomIn');
        await commands.executeCommand('workbench.action.zoomIn');
    });

    beforeEach(async function () {
        await commands.executeCommand('editor.unfoldAll');
        await wait();

        // Reset cursor position to 0,0?
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait();
    });

    afterEach(async function () {});

    test('Toggle and jump across editors', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.f');
        await commands.executeCommand('jumpy2.n');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });
});
