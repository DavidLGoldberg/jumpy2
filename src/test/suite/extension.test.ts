import assert from 'assert';
import { after, before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { commands, window } from 'vscode';

suite('Extension Test Suite', () => {
    before(() => {
        window.showInformationMessage('Test the tests.');
    });

    after(async () => {
        await commands.executeCommand('editor.unfoldAll');
        await commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('Sample test', () => {
        assert.strictEqual(1, 1);
    });
});
