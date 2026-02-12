import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window, workspace } from 'vscode';

const ONE_MINUTE = 60000;

async function wait(timeout = 100): Promise<void> {
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

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz', true);
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
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

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.j');
        await commands.executeCommand('jumpy2.j');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 0));
    });

    test('Toggle and jump - alpha only (a-z, no digits)', async function () {
        let position: Position | undefined;

        // Set customKeys to just letters, no digits
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

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 3));

        // Reset to include digits for subsequent tests
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz0123456789', true);
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

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 3));
    });
});
