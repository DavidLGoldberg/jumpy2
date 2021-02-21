import * as path from 'path';
import * as assert from 'assert';
import { after, afterEach, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';
// This maybe for unit test stuff?
// import * as Jumpy2 from '../../../src/extension';

const ONE_MIN = 60000;
const QUARTER_SECOND = 250;

async function wait(timeout = QUARTER_SECOND): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_text.md'
);

suite('Basic test Suite', function () {
    this.timeout(ONE_MIN);
    before(async function () {
        window.showInformationMessage('Start all basic tests.');

        await commands.executeCommand('workbench.action.zoomReset');
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
        await commands.executeCommand('editor.unfoldAll');
        await wait();

        // Reset cursor position to 0,0?
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait();
    });

    afterEach(async function () {});

    test('Toggle and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Toggle and jump to camel', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.e');
        await commands.executeCommand('jumpy.c');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(30, 10));
    });

    test('Toggle reset and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.reset');
        await commands.executeCommand('jumpy.b');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(10, 15));
    });

    test('Toggle then not found then jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.z');
        await commands.executeCommand('jumpy.z');
        // One extra to ensure it doesn't matter:
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Multiple toggles', async function () {
        let position: Position | undefined;
        // Should do no change
        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.toggle');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        // Should reopen and jump
        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.toggle');
        await wait();
        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Clear command', async function () {
        let position: Position | undefined;
        // Should do no change
        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.clear');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        // Should clear and still remain in place
        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.clear');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        // then should jump afterwards
        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Jump to folded text (start)', async function () {
        let position: Position | undefined;

        await commands.executeCommand('editor.foldAll');

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.d');
        await commands.executeCommand('jumpy.g');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(21, 2));
    });

    test('Jump to folded text (next)', async function () {
        let position: Position | undefined;

        await commands.executeCommand('editor.foldAll');

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.d');
        await commands.executeCommand('jumpy.h');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(24, 2));
    });
});
