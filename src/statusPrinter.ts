import { sample } from 'lodash';

export default function statusPrinter(statusMarkup: string) {
    // TODO: Move to config:
    const jumpers = ['🐒', '🐸', '🐬', '🦗', '🕷️', '🐰', '🦘'];

    const date = new Date();
    const today = `${date.getMonth() + 1}/${date.getDate()}`;

    // Cycle between the jumpers! Add in Holiday cheer!
    const holidayEmojis: Record<string, string[]> = {
        '1/1': ['🎉', '🥳'],
        '10/31': ['🎃', '👻', '🍬', '🔮', '🕸️', '🧛', '🧟'],
        '12/25': ['🎄', '⛄'],
    };
    const todaysEmojis: string[] = holidayEmojis[today] || [];
    const jumperPrefix = todaysEmojis.length
        ? sample(todaysEmojis) + ' '
        : sample(jumpers) + ' ';

    // TODO:
    // magic mushroom? mario noise?

    return `${jumperPrefix}Jumpy: ${statusMarkup}`;
}
