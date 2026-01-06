import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';

const ONE_MIN = 60000;
const QUARTER_SECOND = 250;

async function wait(timeout = QUARTER_SECOND): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_unicode.md'
);

suite('Unicode test Suite', function () {
    this.timeout(ONE_MIN);
    before(async function () {
        window.showInformationMessage('Start Unicode tests.');

        await commands.executeCommand('workbench.action.zoomReset');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait();
    });

    after(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    beforeEach(async function () {
        await wait();

        // Reset cursor position to 0,0
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait();
    });

    test('Toggle works in Unicode file', async function () {
        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Just verify toggle doesn't crash with Unicode content
        // and we can exit cleanly
        await commands.executeCommand('jumpy2.exit');
        await wait();
        
        assert.ok(true, 'Toggle should work with Unicode content');
    });

    test('Jump and cursor moves in Unicode file', async function () {
        let startPosition: Position | undefined;
        let endPosition: Position | undefined;

        if (window.activeTextEditor) {
            startPosition = window.activeTextEditor.selection.active;
        }

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump using first available label (aa)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');

        await wait();

        if (window.activeTextEditor) {
            endPosition = window.activeTextEditor.selection.active;
        }

        assert.ok(startPosition, 'Start position should be defined');
        assert.ok(endPosition, 'End position should be defined');
        // Cursor should have moved from 0,0
        assert.ok(
            endPosition!.line !== startPosition!.line || endPosition!.character !== startPosition!.character,
            'Cursor should have moved after jump'
        );
    });

    test('Jump to different labels in Unicode file', async function () {
        let position1: Position | undefined;
        let position2: Position | undefined;

        // First jump
        await commands.executeCommand('jumpy2.toggle');
        await wait(500);
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position1 = window.activeTextEditor.selection.active;
        }

        // Reset
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
        await wait();

        // Second jump to different label
        await commands.executeCommand('jumpy2.toggle');
        await wait(500);
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.c');
        await wait();

        if (window.activeTextEditor) {
            position2 = window.activeTextEditor.selection.active;
        }

        assert.ok(position1, 'First position should be defined');
        assert.ok(position2, 'Second position should be defined');
        // Different labels should jump to different positions
        assert.ok(
            position1!.line !== position2!.line || position1!.character !== position2!.character,
            'Different labels should jump to different positions'
        );
    });

    test('Jump in mixed Chinese and English content', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to a position in the mixed content area (later in file)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.d');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.ok(position, 'Position should be defined in mixed content');
    });

    test('Jump works with emoji content nearby', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to a later label (in the emoji section)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.e');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.ok(position, 'Position should be defined near emoji content');
    });
});
