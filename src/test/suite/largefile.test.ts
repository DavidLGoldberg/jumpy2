import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';
// This maybe for unit test stuff?
// import  Jumpy2 from '../../../src/extension';
const ONE_MINUTE = 60000;
const QUARTER_SECOND = 250;

async function wait(timeout = QUARTER_SECOND): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_long_text.txt'
);

suite.skip('Long file test Suite', function () {
    this.timeout(ONE_MINUTE);
    before(async function () {
        window.showInformationMessage('Start long file tests.');

        await commands.executeCommand('workbench.action.zoomReset');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait();
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0?
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait();
    });

    test('Toggle and jump', async function () {
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');

        await wait();

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(0, 101)
        );

        await wait(500);

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.A');
        await commands.executeCommand('jumpy2.z');

        await wait(2500); // this is annoying but it really needs more time...

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(26, 101)
        );

        await wait();
    });
});
