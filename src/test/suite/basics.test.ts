import path from 'path';
import assert from 'assert';
import { after, afterEach, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';

const ONE_MIN = 60000;

async function wait(timeout = 100): Promise<void> {
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
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    beforeEach(async function () {
        await commands.executeCommand('editor.unfoldAll');

        // Reset cursor position to 0,0
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    afterEach(async function () {});

    test('Toggle and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Toggle and jump to camel', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.e');
        await commands.executeCommand('jumpy2.c');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(30, 10));
    });

    test('Toggle reset and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.reset');
        await commands.executeCommand('jumpy2.b');
        await commands.executeCommand('jumpy2.z');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(10, 15));
    });

    test('Toggle then not found then jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.z');
        await commands.executeCommand('jumpy2.z');
        // One extra to ensure it doesn't matter:
        await commands.executeCommand('jumpy2.z');

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Multiple toggles', async function () {
        let position: Position | undefined;
        // Should do no change
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.toggle');

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        // Should reopen and jump
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    test('Exit command', async function () {
        let position: Position | undefined;
        // Should do no change
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.exit');

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        // Should exit and still remain in place
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.exit');

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));

        // then should jump afterwards
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(4, 15));
    });

    // These tests are not working because of a bug in vscode (pretty sure).

    // Maybe I'll try to work on a fix.  The folding does not seem to get "flushed" before read of visibleRanges.
    // This can be replicated easily in human time manually by 'Fold All', then loading jump mode,
    // and debugging to see there is still just one visibleRange instead of multiple.

    // test('Jump to folded text (start)', async function () {
    //     let position: Position | undefined;

    //     await commands.executeCommand('editor.foldAll');

    //     await commands.executeCommand('jumpy2.toggle');
    //     await commands.executeCommand('jumpy2.d');
    //     await commands.executeCommand('jumpy2.g');

    //     await wait();

    //     if (window.activeTextEditor) {
    //         position = window.activeTextEditor.selection.active;
    //     }

    //     assert.deepStrictEqual(position, new Position(21, 2));
    // });

    // test('Jump to folded text (next)', async function () {
    //     let position: Position | undefined;

    //     await commands.executeCommand('editor.foldAll');

    //     await commands.executeCommand('jumpy2.toggle');
    //     await commands.executeCommand('jumpy2.d');
    //     await commands.executeCommand('jumpy2.h');

    //     await wait();

    //     if (window.activeTextEditor) {
    //         position = window.activeTextEditor.selection.active;
    //     }

    //     assert.deepStrictEqual(position, new Position(24, 2));
    // });
});
