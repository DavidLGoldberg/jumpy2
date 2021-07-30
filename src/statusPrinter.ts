import sample from 'lodash.sample';
import { workspace } from 'vscode';

function getJumper(): string {
    // TODO: Move to config:
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

export default function statusPrinter(statusMarkup: string) {
    const useJumperEmoji = workspace
        .getConfiguration('jumpy2')
        .get('jumperEmojis.active');

    const jumper = getJumper();

    return `${
        useJumperEmoji && jumper !== '' ? jumper : ''
    }Jumpy: ${statusMarkup}`;
}
