import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window, workspace } from 'vscode';
// This maybe for unit test stuff?
const ONE_MINUTE = 60000;
const QUARTER_SECOND = 250;

async function wait(timeout = QUARTER_SECOND): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_text.md'
);

suite('Custom Keys test Suite', function () {
    this.timeout(ONE_MINUTE);
    before(async function () {
        window.showInformationMessage('Start custom keys tests.');

        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'fjdkslaghrueiwoncmv', true);

        await wait();

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait();
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz', true);

        await wait();
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0?
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait();
    });

    test('Toggle and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.f');
        await commands.executeCommand('jumpy2.f');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        await wait();

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.j');
        await commands.executeCommand('jumpy2.j');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 0));

        await wait();
    });

    test('Toggle and jump - alpha only (a-z, no digits)', async function () {
        let position: Position | undefined;

        // Set customKeys to just letters, no digits
        // This tests the scenario where digit keybindings exist in package.json
        // but digit commands (jumpy2.0-9) are not registered
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz', true);

        await wait();

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        await wait();

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 3));

        await wait();

        // Reset to include digits for subsequent tests
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz0123456789', true);

        await wait();
    });

    test('Toggle and jump - empty custom keys', async function () {
        let position: Position | undefined;

        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', '', true);

        await wait();

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        await wait();

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 3));

        await wait();
    });
});
