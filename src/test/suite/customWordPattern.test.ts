import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window, workspace } from 'vscode';

const ONE_MINUTE = 60000;
const IS_CI = !!process.env.TF_BUILD;

async function wait(timeout = IS_CI ? 200 : 100): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_text.md'
);

suite('Custom Word Pattern test Suite', function () {
    this.timeout(ONE_MINUTE);

    let originalWordPattern: string | undefined;

    before(async function () {
        window.showInformationMessage('Start custom word pattern tests.');

        // Save the original wordPattern
        originalWordPattern = workspace
            .getConfiguration('jumpy2')
            .get('wordPattern');

        // Set the aggressive word pattern: matches any 1-3 non-whitespace chars
        await workspace
            .getConfiguration('jumpy2')
            .update('wordPattern', '[^\\s]{1,3}', true);
        await wait();

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait();
    });

    after(async () => {
        await commands.executeCommand('workbench.action.closeAllEditors');

        // Restore the original wordPattern
        await workspace
            .getConfiguration('jumpy2')
            .update('wordPattern', originalWordPattern, true);
    });

    beforeEach(async function () {
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    test('Toggle and jump with aggressive pattern', async function () {
        let position: Position | undefined;

        // Basic jump should still work
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // First label 'aa' should be at position 0,0
        assert.deepStrictEqual(position, new Position(0, 0));
    });

    test('Aggressive pattern jumps more specifically', async function () {
        // With [^\s]{1,3}, we get labels at each word position
        // Test jumping to a position further in the file

        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.d');
        await commands.executeCommand('jumpy2.m');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }
        assert.deepStrictEqual(position, new Position(21, 0));

        // Need to toggle again - Jumpy exits after each successful jump
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.d');
        await commands.executeCommand('jumpy2.n');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }
        assert.deepStrictEqual(position, new Position(21, 2));
    });

    test('Reset works with aggressive pattern', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.reset');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.c');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // 'ac' label should be at position 0,6 (third match)
        assert.deepStrictEqual(position, new Position(0, 6));
    });
});
