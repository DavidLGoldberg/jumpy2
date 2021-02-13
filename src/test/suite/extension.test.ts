import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window } from 'vscode';

suite('Extension Test Suite', () => {
    before(() => {
        window.showInformationMessage('Test the tests.');
    });

    test('Sample test', () => {
        assert.strictEqual(1, 1);
    });
});
