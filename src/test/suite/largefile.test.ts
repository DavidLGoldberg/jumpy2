import * as path from 'path';
import * as assert from 'assert';
import { after, before, beforeEach } from 'mocha';

import { commands, Selection, Position, Uri, window } from 'vscode';
// This maybe for unit test stuff?
// import * as Jumpy2 from '../../../src/extension';

const ONE_SECOND = 1000;
const TWO_SECONDS = 1000;

async function wait(timeout = TWO_SECONDS): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_long_text.txt'
);

suite('Long file test Suite', function () {
    this.timeout(60000); // 1 min
    before(async function () {
        window.showInformationMessage('Start long file tests.');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait();
    });

    after(async () => {
        // TODO: close file?
    });

    beforeEach(async function () {
        // Reset cursor position to 0,0?
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait(ONE_SECOND);
    });

    test('Toggle and jump', async function () {
        let position: Position | undefined;

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.a');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(0, 101));

        await wait();

        await commands.executeCommand('jumpy.toggle');
        await commands.executeCommand('jumpy.A');
        await commands.executeCommand('jumpy.z');

        await wait();

        if (window.activeTextEditor) {
            position = window.activeTextEditor.selection.active;
        }

        assert.deepStrictEqual(position, new Position(26, 101));
    });
});
