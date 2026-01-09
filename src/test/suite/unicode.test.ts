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

    test('Jump and cursor moves in Unicode file', async function () {
        let position1: Position | undefined;
        let position2: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump using first available label (aa) -> "Unicode" at line 0, char 2
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.a');

        await wait();

        if (window.activeTextEditor) {
            position1 = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position1, new Position(0, 2));

        // Next jump to 'ab' -> "Test" at line 0, char 10
        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.b');
        await wait();

        if (window.activeTextEditor) {
            position2 = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position2, new Position(0, 10));
        const charAtCursor = window.activeTextEditor!.document.getText(
            new Selection(
                position2,
                new Position(position2.line, position2.character + 1)
            )
        );
        assert.strictEqual(
            charAtCursor,
            'T',
            'Cursor should be on "T" of "Test"'
        );
    });

    test('Jump to Chinese character 你', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to 'an' -> 你好 at line 6, char 0 (first Chinese word)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.n');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(6, 0));
        const charAtCursor = window.activeTextEditor!.document.getText(
            new Selection(
                position,
                new Position(position.line, position.character + 1)
            )
        );
        assert.strictEqual(
            charAtCursor,
            '你',
            'Cursor should be on Chinese character 你'
        );
    });

    test('Jump to Japanese character こ', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to 'at' -> こんにちは at line 12, char 0 (Japanese greeting)
        await commands.executeCommand('jumpy2.a');
        await commands.executeCommand('jumpy2.t');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
            const doc = window.activeTextEditor.document;
            const charAtCursor = doc.getText(
                new Selection(
                    position,
                    new Position(position.line, position.character + 1)
                )
            );
            assert.deepStrictEqual(position, new Position(12, 0));
            assert.strictEqual(
                charAtCursor,
                'こ',
                'Cursor should be on Japanese character こ'
            );
        }
    });

    test('Single emoji gets a label - jump to 👋', async function () {
        // Each emoji gets its own label
        // Pattern: \p{Extended_Pictographic} matches each emoji individually
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to 'bw' -> 👋 emoji at line 32, char 6
        await commands.executeCommand('jumpy2.b');
        await commands.executeCommand('jumpy2.w');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
            const doc = window.activeTextEditor.document;
            // Emoji is 2 code units wide, so we read 2 characters
            const charAtCursor = doc.getText(
                new Selection(
                    position,
                    new Position(position.line, position.character + 2)
                )
            );
            assert.deepStrictEqual(position, new Position(32, 6));
            assert.strictEqual(
                charAtCursor,
                '👋',
                'Cursor should be on wave emoji 👋'
            );
        }
    });

    test('Emoji pair - jump to first emoji 🎉', async function () {
        // Emoji pairs like 🎉🎊 each get their own label
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to 'ct' -> first emoji 🎉 at line 40, char 0
        await commands.executeCommand('jumpy2.c');
        await commands.executeCommand('jumpy2.t');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
            const doc = window.activeTextEditor.document;
            const charAtCursor = doc.getText(
                new Selection(
                    position,
                    new Position(position.line, position.character + 2)
                )
            );
            assert.deepStrictEqual(position, new Position(40, 0));
            assert.strictEqual(
                charAtCursor,
                '🎉',
                'Cursor should be on party popper emoji 🎉'
            );
        }
    });

    test('Emoji pair - jump to second emoji 🎊', async function () {
        // Second emoji in the pair gets its own label
        let position: Position | undefined;

        await commands.executeCommand('jumpy2.toggle');
        await wait(500);

        // Jump to 'cu' -> second emoji 🎊 at line 40, char 2
        await commands.executeCommand('jumpy2.c');
        await commands.executeCommand('jumpy2.u');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
            const doc = window.activeTextEditor.document;
            const charAtCursor = doc.getText(
                new Selection(
                    position,
                    new Position(position.line, position.character + 2)
                )
            );
            assert.deepStrictEqual(position, new Position(40, 2));
            assert.strictEqual(
                charAtCursor,
                '🎊',
                'Cursor should be on confetti ball emoji 🎊'
            );
        }
    });
});
