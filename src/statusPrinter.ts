import sample from 'lodash.sample';
import {
    StatusBarAlignment,
    StatusBarItem,
    ThemeColor,
    window,
    workspace,
} from 'vscode';

function getJumper(): string {
    const jumpers: Array<string> | undefined = workspace
        .getConfiguration('jumpy2')
        .get('jumperEmojis.jumperSet');

    const date = new Date();
    const today = `${date.getMonth() + 1}/${date.getDate()}`;

    // Cycle between the jumpers! Add in Holiday cheer!
    const holidayEmojis: Record<string, string[]> = {
        '1/1': ['🎉', '🥳'],
        '10/31': ['🎃', '👻', '🍬', '🔮', '🕸️', '🧛', '🧟'],
        '12/25': ['🎄', '⛄'],
    };

    const todaysEmojis: string[] = holidayEmojis[today] || [];

    return todaysEmojis.length
        ? sample(todaysEmojis) + ' '
        : sample(jumpers) + ' ';

    // TODO: magic mushroom? mario noise? (achievements, etc)
}

function statusPrinter(statusMarkup: string) {
    const useJumperEmoji = workspace
        .getConfiguration('jumpy2')
        .get('jumperEmojis.active');

    const jumper = getJumper();

    return `${(useJumperEmoji && jumper) || ''}Jumpy: ${statusMarkup}`;
}

export function createStatusBar() {
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 1000);
    statusBar.command = 'jumpy2.showAchievements';
    return statusBar;
}

export function createModeStatusBar() {
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 999);
    statusBar.command = 'jumpy2.invertJumpyModes';
    statusBar.tooltip = 'Click to invert Jumpy default modes (Classic/Squint)';
    return statusBar;
}

export function setStatusBar(
    statusBarItem: StatusBarItem,
    statusMarkup: string
) {
    if (statusMarkup === '') {
        statusBarItem.hide();
    } else {
        statusBarItem.text = statusPrinter(statusMarkup);

        statusBarItem.color = statusMarkup.includes('No Match')
            ? new ThemeColor('errorForeground')
            : new ThemeColor('editorInfo.foreground');

        statusBarItem.show();
    }
}

export function setModeStatusBar(
    modeStatusBarItem: StatusBarItem,
    isActive: boolean,
    isSquintMode: boolean,
    isModesInverted: boolean
) {
    if (isActive) {
        modeStatusBarItem.text = isSquintMode
            ? '🧐 Squint Mode'
            : '$(symbol-keyword) Classic Mode';
        modeStatusBarItem.color = new ThemeColor('editorInfo.foreground');
        modeStatusBarItem.show();
    } else {
        // clear the mode status bar when not active
        modeStatusBarItem.hide();
    }
}
