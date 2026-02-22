import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Position, Selection, Uri, window } from 'vscode';

const ONE_MIN = 60000;
const IS_CI = !!process.env.TF_BUILD;
const ONLY_IN_CI = IS_CI ? 500 : 0;

async function wait(timeout = IS_CI ? 200 : 100): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_text.md'
);

suite('Status Bar Suite', function () {
    this.timeout(ONE_MIN);
    before(async function () {
        window.showInformationMessage('Start all status bar tests.');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    test('Selection change exits jump mode cleanly', async function () {
        // arrange:
        await wait(400); // debounce from beforeEach to clear
        await commands.executeCommand('jumpy2.toggle');
        await wait(ONLY_IN_CI);

        // act: simulate mouse click by changing selection
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(2, 5, 2, 5);
        }
        await wait(500); // exit debounce (350ms) plus buffer

        // assert: cursor should be at the clicked position (not jumped)
        let position: Position | undefined;
        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }
        assert.deepStrictEqual(position, new Position(2, 5));

        // act: re-enter jump mode after click exit
        await commands.executeCommand('jumpy2.toggle');
        await wait(ONLY_IN_CI);
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');
        await wait();

        // assert: should still jump correctly
        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }
        assert.deepStrictEqual(position, new Position(4, 15));
    });
});
