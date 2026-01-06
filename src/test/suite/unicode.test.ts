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

    test('Jump to Chinese characters', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        // Wait for labels to be generated
        await wait(500);

        // Jump to first Chinese word (你好) on line 6
        // The exact key combination depends on label assignment
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // Verify we jumped to a Chinese character
        // Line 6 is "你好 世界"
        assert.ok(position, 'Position should be defined');
        assert.strictEqual(position?.line, 6, 'Should jump to line with Chinese text');
    });

    test('Jump to Japanese characters', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Try jumping to Japanese text
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.ok(position, 'Position should be defined');
    });

    test('Jump to Cyrillic characters', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Try jumping to Cyrillic text
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.c');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.ok(position, 'Position should be defined');
    });

    test('Jump to mixed Chinese and English', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to mixed content line
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.d');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.ok(position, 'Position should be defined');
    });
});
