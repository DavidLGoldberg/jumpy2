// achievements.test.ts
import path from 'path';
import assert from 'assert';
import { before } from 'mocha';
import { commands, window } from 'vscode';

const ONE_MIN = 60000;
const QUARTER_SECOND = 250;

async function wait(timeout = QUARTER_SECOND): Promise<void> {
    await new Promise((res) => setTimeout(res, timeout));
}

let achievements: any;
suite('Achievements Suite', function () {
    this.timeout(ONE_MIN);
    before(async function () {
        window.showInformationMessage('Start all achievements tests.');
        achievements = await import(
            path.resolve(__dirname, '../../achievements')
        );
    });

    test('Toggle', async function () {
        await commands.executeCommand('jumpy2.showAchievements');
        await wait();
        // close it? Don't seem to need to atm.
    });

    test('99 should return no achievements', () => {
        const htmlContent = achievements.achievementsWebview(99);
        // Assert that the HTML content contains the expected elements/values
        assert(htmlContent.includes('🦥'));
        assert(htmlContent.includes('Total career jumps: 99'));
        assert(!htmlContent.includes('👏'));
        // ...other assertions
    });
    test('100 should return achievement grasshopper level (1)', () => {
        const htmlContent = achievements.achievementsWebview(100);
        // Assert that the HTML content contains the expected elements/values
        assert(htmlContent.includes('🦗'));
        assert(htmlContent.includes('Total career jumps: 100 👏'));
        // ...other assertions
    });
    test('101 should return achievement grasshopper level (1)', () => {
        const htmlContent = achievements.achievementsWebview(101);
        // Assert that the HTML content contains the expected elements/values
        assert(htmlContent.includes('🦗'));
        assert(htmlContent.includes('Total career jumps: 101 👏'));
        // ...other assertions
    });
    test('1,000 should return achievement frog level (2)', () => {
        const htmlContent = achievements.achievementsWebview(1_000);
        // Assert that the HTML content contains the expected elements/values
        assert(htmlContent.includes('🐸'));
        assert(htmlContent.includes('Total career jumps: 1000 👏'));
        // ...other assertions
    });
    test('10,000 should return achievement ninja level (6)', () => {
        const htmlContent = achievements.achievementsWebview(10_000);
        // Assert that the HTML content contains the expected elements/values
        assert(htmlContent.includes('🥷'));
        assert(htmlContent.includes("You're a true Jumpy Ninja!"));
        assert(htmlContent.includes('Total career jumps: 10000 👏'));
        // ...other assertions
    });
    test('10,001 should return achievement ninja level (6)', () => {
        const htmlContent = achievements.achievementsWebview(10_001);
        // Assert that the HTML content contains the expected elements/values
        assert(htmlContent.includes('🥷'));
        assert(htmlContent.includes("You're a true Jumpy Ninja!"));
        assert(htmlContent.includes('Total career jumps: 10001 👏'));
        // ...other assertions
    });
});
