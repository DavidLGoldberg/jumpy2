import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';

const ONE_MIN = 60000;
const IS_CI = !!process.env.TF_BUILD;

async function wait(timeout = IS_CI ? 200 : 100): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_squint.md'
);

suite('Squint mode test Suite', function () {
    this.timeout(ONE_MIN);
    before(async function () {
        window.showInformationMessage('Start squint mode tests.');

        await commands.executeCommand('workbench.action.zoomReset');
        // Zoom IN for squint mode (opposite of usual zoom out)
        await commands.executeCommand('workbench.action.zoomIn');
        await commands.executeCommand('workbench.action.zoomIn');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
    });

    after(async () => {
        // Zoom back out the same number of zooms to clean up
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.zoomOut');
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    test('Squint toggle and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggleSquint');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // 'aa' = first label = first non-whitespace char = position (0, 0)
        assert.deepStrictEqual(position, new Position(0, 0));
    });

    test('Squint jump to second character', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggleSquint');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // 'ab' = second label = second non-whitespace char = position (0, 1)
        assert.deepStrictEqual(position, new Position(0, 1));
    });

    test('Squint jump across space', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggleSquint');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.c');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // 'ac' = third label = skips space, lands on 'c' in "cd" = position (0, 3)
        assert.deepStrictEqual(position, new Position(0, 3));
    });

    test('Squint selection mode extends selection', async function () {
        // Start cursor at (0, 0)
        let selection: Selection | undefined;

        await commands.executeCommand('jumpy2.toggleSquintSelection');
        // Jump to 'ac' = third label = position (0, 3)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.c');
        await wait();

        if (window.activeTextEditor) {
            selection = window.activeTextEditor.selection;
        }

        // Anchor should remain at (0, 0), active should be at (0, 3)
        assert.deepStrictEqual(selection?.anchor, new Position(0, 0));
        assert.deepStrictEqual(selection?.active, new Position(0, 3));
    });

    test('switchMode (tab) from classic to squint', async function () {
        let position: Position | undefined;

        // Start in classic (word) mode
        await commands.executeCommand('jumpy2.toggle');
        // Press tab to switch to squint (character) mode
        await commands.executeCommand('jumpy2.switchMode');
        // In squint mode, 'ab' = second character = position (0, 1)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // In classic mode 'ab' would be (0, 3) (second word "cd")
        // In squint mode 'ab' is (0, 1) (second character "b")
        assert.deepStrictEqual(position, new Position(0, 1));
    });

    test('switchMode (tab) from squint to classic', async function () {
        let position: Position | undefined;

        // Start in squint (character) mode
        await commands.executeCommand('jumpy2.toggleSquint');
        // Press tab to switch to classic (word) mode
        await commands.executeCommand('jumpy2.switchMode');
        // In classic mode, 'ab' = second word = position (0, 3)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // In squint mode 'ab' would be (0, 1) (second character)
        // In classic mode 'ab' is (0, 3) (second word "cd")
        assert.deepStrictEqual(position, new Position(0, 3));
    });

    test('switchMode (tab) preserves selection mode', async function () {
        let selection: Selection | undefined;

        // Start in squint selection mode
        await commands.executeCommand('jumpy2.toggleSquintSelection');
        // Press tab to switch to classic — selection mode should be preserved
        await commands.executeCommand('jumpy2.switchMode');
        // In classic mode, 'ab' = second word = position (0, 3)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            selection = window.activeTextEditor.selection;
        }

        // Selection should extend from anchor (0, 0) to active (0, 3)
        assert.deepStrictEqual(selection?.anchor, new Position(0, 0));
        assert.deepStrictEqual(selection?.active, new Position(0, 3));
    });

    test('invertJumpyModes makes toggle open squint mode', async function () {
        let position: Position | undefined;

        // Invert modes so toggle defaults to squint
        await commands.executeCommand('jumpy2.invertJumpyModes');
        // Now toggle should open squint (character) mode
        await commands.executeCommand('jumpy2.toggle');
        // In squint mode, 'ab' = second character = position (0, 1)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // If modes were NOT inverted, toggle would open classic and 'ab' = (0, 3)
        // With inversion, toggle opens squint and 'ab' = (0, 1)
        assert.deepStrictEqual(position, new Position(0, 1));

        // Restore modes back to normal
        await commands.executeCommand('jumpy2.invertJumpyModes');
    });

    test('invertJumpyModes makes toggleSquint open classic mode', async function () {
        let position: Position | undefined;

        // Invert modes so toggleSquint defaults to classic
        await commands.executeCommand('jumpy2.invertJumpyModes');
        // Now toggleSquint should open classic (word) mode
        await commands.executeCommand('jumpy2.toggleSquint');
        // In classic mode, 'ab' = second word = position (0, 3)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // If modes were NOT inverted, toggleSquint would open squint and 'ab' = (0, 1)
        // With inversion, toggleSquint opens classic and 'ab' = (0, 3)
        assert.deepStrictEqual(position, new Position(0, 3));

        // Restore modes back to normal
        await commands.executeCommand('jumpy2.invertJumpyModes');
    });

    test('invertJumpyModes double invert restores original behavior', async function () {
        let position: Position | undefined;

        // Invert twice = back to normal
        await commands.executeCommand('jumpy2.invertJumpyModes');
        await commands.executeCommand('jumpy2.invertJumpyModes');
        // toggle should open classic (word) mode as usual
        await commands.executeCommand('jumpy2.toggle');
        // In classic mode, 'ab' = second word = position (0, 3)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 3));
    });

    test('invertJumpyModes makes toggleSelection open squint selection', async function () {
        let selection: Selection | undefined;

        // Invert modes so toggleSelection defaults to squint
        await commands.executeCommand('jumpy2.invertJumpyModes');
        // Now toggleSelection should open squint (character) selection mode
        await commands.executeCommand('jumpy2.toggleSelection');
        // Jump to 'ab' = second character = position (0, 1)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            selection = window.activeTextEditor.selection;
        }

        // With inversion, toggleSelection opens squint selection
        // 'ab' in squint = (0, 1), anchor stays at (0, 0)
        assert.deepStrictEqual(selection?.anchor, new Position(0, 0));
        assert.deepStrictEqual(selection?.active, new Position(0, 1));

        // Restore modes back to normal
        await commands.executeCommand('jumpy2.invertJumpyModes');
    });

    test('invertJumpyModes makes toggleSquintSelection open classic selection', async function () {
        let selection: Selection | undefined;

        // Invert modes so toggleSquintSelection defaults to classic
        await commands.executeCommand('jumpy2.invertJumpyModes');
        // Now toggleSquintSelection should open classic (word) selection mode
        await commands.executeCommand('jumpy2.toggleSquintSelection');
        // Jump to 'ab' = second word = position (0, 3)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            selection = window.activeTextEditor.selection;
        }

        // With inversion, toggleSquintSelection opens classic selection
        // 'ab' in classic = (0, 3), anchor stays at (0, 0)
        assert.deepStrictEqual(selection?.anchor, new Position(0, 0));
        assert.deepStrictEqual(selection?.active, new Position(0, 3));

        // Restore modes back to normal
        await commands.executeCommand('jumpy2.invertJumpyModes');
    });

    test('Squint exit returns to normal mode', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggleSquint');
        await commands.executeCommand('jumpy2.exit');

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        // Should not have moved
        assert.deepStrictEqual(position, new Position(0, 0));

        // Normal toggle should still work after squint exit
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.exit');

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 0));
    });
});
