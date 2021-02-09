import * as path from 'path';
import * as assert from 'assert';
import { before, beforeEach } from 'mocha';

import { commands, Position, Selection, Uri, window } from 'vscode';
// This maybe for unit test stuff?
// import * as Jumpy2 from '../../../src/extension';

const ONE_MIN = 60000;
const ONE_SECOND = 1000;
const TWO_SECONDS = 1000;

async function wait(timeout = TWO_SECONDS): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

const fixtureFile = path.resolve(
    __dirname,
    '../../../src/test/fixtures/test_text.md'
);

suite('Status Bar Suite', function () {
    this.timeout(60000); // 1 min
    before(async function () {
        window.showInformationMessage('Start all status bar tests.');

        const uri = Uri.file(fixtureFile);
        await commands.executeCommand('vscode.open', uri);
        await wait();
    });
    
    beforeEach(async function() {
        // Reset cursor position to 0,0?
        if (window.activeTextEditor) {
            window.activeTextEditor.selection = new Selection(0, 0, 0, 0);
        }

        await wait(ONE_SECOND);
    });

    test('Toggle', async function () {
        let position: Position | undefined;

        //TODO FINISH
        await commands.executeCommand('jumpy.toggle');
        await wait(ONE_SECOND);
        //assert
        await commands.executeCommand('jumpy.a');
        await wait(ONE_SECOND); // necessary?
        //assert
        await commands.executeCommand('jumpy.z');
        await wait(ONE_SECOND); // necessary?
        //assert

        // TODO: test status bar
        assert.strictEqual(1, 1);
    });
});
