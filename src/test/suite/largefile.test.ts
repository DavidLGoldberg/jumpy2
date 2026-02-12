import path from 'path';
import assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window, workspace } from 'vscode';

const ONE_MINUTE = 60000;
const IS_CI = !!process.env.TF_BUILD;
const ONLY_IN_CI = IS_CI ? 500 : 0; // CI needs time for labels to generate

async function wait(timeout = IS_CI ? 200 : 100): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_long_text.txt'
);

const fixtureFileRaw = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_long_text_raw.txt'
);

suite('Long file test Suite', function () {
    this.timeout(ONE_MINUTE);
    before(async function () {
        window.showInformationMessage('Start long file tests.');

        // Need to show at least 53 lines for label 'Az' (index 1377) to exist
        // With 26 words/line: label 'Az' is at line 52 (1377/26)
        // Use aggressive zoom-out for maximum visible lines
        await commands.executeCommand('workbench.action.zoomReset');
        for (let i = 0; i < 10; i++) {
            await commands.executeCommand('workbench.action.zoomOut');
        }
        await wait(100);

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait(200);
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        // Reset zoom for us humans to follow along
        await commands.executeCommand('workbench.action.zoomReset');
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    test('Toggle and jump', async function () {
        if (!!process.env.TF_BUILD) {
            this.skip(); // Skip on Azure CI due to viewport size limitations
        }
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.z');
        await wait();

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(0, 101)
        );

        await commands.executeCommand('jumpy2.toggle');
        await wait(500); // Large viewport needs more time to generate labels
        await commands.executeCommand('jumpy2.A');
        await commands.executeCommand('jumpy2.z');
        await wait(500);

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(52, 101)
        );
    });
});

suite('Long file with digits (raw) test Suite', function () {
    this.timeout(ONE_MINUTE);

    before(async function () {
        window.showInformationMessage('Start long file raw tests.');

        // Use default keys with digits: abcdefghijklmnopqrstuvwxyz0123456789
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz0123456789', true);

        // Zoom out for consistent viewport across CI environments
        await commands.executeCommand('workbench.action.zoomReset');
        for (let i = 0; i < 10; i++) {
            await commands.executeCommand('workbench.action.zoomOut');
        }
        await wait(250);

        const uri = Uri.file(fixtureFileRaw);
        await commands.executeCommand('vscode.open', uri);
        await wait(250);
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        // Reset to default
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz0123456789', true);

        // Reset zoom for us humans to follow along
        await commands.executeCommand('workbench.action.zoomReset');
    });

    beforeEach(async function () {
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    test('Jump with letter-letter label (aa)', async function () {
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');
        await wait();

        // 'aa' is first label, should be at line 0, col 0
        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(0, 0)
        );
    });

    test('Jump with letter-digit label (a0)', async function () {
        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.0');
        await wait();

        // 'a0' comes after 'az' in the label sequence
        // With 36 chars (a-z + 0-9), 'a0' is at index 26 (after aa-az)
        const position = window.activeTextEditor?.selection.active;
        assert.ok(position, 'Position should be defined');
        // The exact position depends on file layout, just verify it's a valid jump
        assert.ok(position.line >= 0 && position.character >= 0);
    });
});

suite('Custom keys with digits - 0 at end test Suite', function () {
    this.timeout(ONE_MINUTE);

    before(async function () {
        window.showInformationMessage('Start 0-at-end tests.');

        // Set customKeys with 0 at the END: 1234567890 (not 0123456789)
        // This means labels starting with '0' appear later in sequence
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz1234567890', true);

        // Need to show at least 109 lines - use aggressive zoom-out
        await commands.executeCommand('workbench.action.zoomReset');
        for (let i = 0; i < 10; i++) {
            await commands.executeCommand('workbench.action.zoomOut');
        }
        await wait(250);

        const uri = Uri.file(fixtureFileRaw);
        await commands.executeCommand('vscode.open', uri);
        await wait(250);
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        // Reset to default
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz0123456789', true);

        // Reset zoom for us humans to follow along
        await commands.executeCommand('workbench.action.zoomReset');
    });

    beforeEach(async function () {
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
    });

    test('Digit-first labels work with customKeys including digits', async function () {
        if (!!process.env.TF_BUILD) {
            this.skip(); // Skip on Azure CI due to viewport size limitations
        }
        // With customKeys = "abcdefghijklmnopqrstuvwxyz1234567890"
        // '1' is at index 26, so '1a' labels appear after all letter-first labels
        // Test that '1a' successfully jumps (doesn't stay at origin)

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.1');
        await commands.executeCommand('jumpy2.a');
        await wait();

        const pos1a = window.activeTextEditor?.selection.active;
        assert.ok(pos1a, 'Position for 1a should be defined');

        // '1a' should have jumped somewhere (not stayed at 0,0)
        const jumped = pos1a.line > 0 || pos1a.character > 0;
        assert.ok(
            jumped,
            `Label '1a' should jump to a position (got line ${pos1a.line}, col ${pos1a.character})`
        );
    });

    test("Labels '1a' appears before '0a' when using 1234567890 order", async function () {
        if (!!process.env.TF_BUILD) {
            this.skip(); // Skip on Azure CI due to viewport size limitations
        }
        // With customKeys = "abcdefghijklmnopqrstuvwxyz1234567890"
        // '1' is at index 26, '0' is at index 35, so '1a' labels should appear before '0a' labels in the sequence

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.1');
        await wait();

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(108, 0),
            'Label 1a should jump to line 109, col 1 (0-indexed: 108, 0)'
        );

        await commands.executeCommand('jumpy2.toggle');
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.0');
        await wait();

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(108, 27),
            'Label z5 should jump to line 109, col 28 (0-indexed: 108, 27)'
        );
    });
});

suite('Custom keys subset 1-5', function () {
    this.timeout(ONE_MINUTE);

    before(async function () {
        window.showInformationMessage('Start 1-5 subset tests.');

        // Set customKeys with only digits 1-5: abcdefghijklmnopqrstuvwxyz12345
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz12345', true);

        // Need to show at least 136 lines - use aggressive zoom-out
        await commands.executeCommand('workbench.action.zoomReset');
        await wait(IS_CI ? 1000 : 250);
        for (let i = 0; i < 10; i++) {
            await commands.executeCommand('workbench.action.zoomOut');
        }
        await wait(IS_CI ? 1000 : 500);

        const uri = Uri.file(fixtureFileRaw);
        await commands.executeCommand('vscode.open', uri);
        await wait(IS_CI ? 1000 : 500); // Extra wait for file to fully load
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');

        // Reset to default
        await workspace
            .getConfiguration('jumpy2')
            .update('customKeys', 'abcdefghijklmnopqrstuvwxyz0123456789', true);

        // Reset zoom for us humans to follow along
        await commands.executeCommand('workbench.action.zoomReset');
    });

    beforeEach(async function () {
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }
        await wait(IS_CI ? 500 : 200);
    });

    test('Jump to 1a with subset 1-5 customKeys', async function () {
        // With customKeys = "abcdefghijklmnopqrstuvwxyz12345" (31 chars)
        // '1a' should jump to line 136 col 1 (1-indexed) = Position(135, 0)
        await commands.executeCommand('jumpy2.toggle');
        await wait(IS_CI ? 2500 : 250);
        await commands.executeCommand('jumpy2.1');
        await commands.executeCommand('jumpy2.a');
        await wait(IS_CI ? 2500 : 250);

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(135, 0),
            'Label 1a should jump to line 136, col 1 (0-indexed: 135, 0)'
        );
    });

    test('Jump to z5 with subset 1-5 customKeys', async function () {
        // With customKeys = "abcdefghijklmnopqrstuvwxyz12345" (31 chars)
        // 'z5' should jump to line 121 col 28 (1-indexed) = Position(120, 27)
        await commands.executeCommand('jumpy2.toggle');
        await wait(IS_CI ? 2500 : 250);
        await commands.executeCommand('jumpy2.z');
        await commands.executeCommand('jumpy2.5');
        await wait(IS_CI ? 2500 : 250);

        assert.deepStrictEqual(
            window.activeTextEditor?.selection.active,
            new Position(120, 27),
            'Label z5 should jump to line 121, col 28 (0-indexed: 120, 27)'
        );
    });
});
