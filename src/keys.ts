import range from 'lodash.range';
import moize from 'moize';

export function getAllKeys(customKeys: ReadonlyArray<string>) {
    let lowerCharacters: Array<string> = [];
    let upperCharacters: Array<string> = [];

    if (!customKeys.length) {
        lowerCharacters = range(
            'a'.charCodeAt(0),
            'z'.charCodeAt(0) + 1 /* for inclusive*/
        ).map((c) => String.fromCharCode(c));
        upperCharacters = range(
            'A'.charCodeAt(0),
            'Z'.charCodeAt(0) + 1 /* for inclusive*/
        ).map((c) => String.fromCharCode(c));
    } else {
        for (let key of customKeys) {
            lowerCharacters.push(key.toLowerCase());
            upperCharacters.push(key.toUpperCase());
        }
    }

    return {
        lowerCharacters: <ReadonlyArray<string>>lowerCharacters,
        upperCharacters: <ReadonlyArray<string>>upperCharacters,
    };
}

function _getKeySet(customKeys: ReadonlyArray<string>) {
    const { lowerCharacters, upperCharacters } = getAllKeys(customKeys);

    const keys: Array<string> = [];

    // A little ugly.
    // I used itertools.permutation in python.
    // Couldn't find a good one in npm.  Don't worry this takes < 1ms once.
    for (let c1 of lowerCharacters) {
        for (let c2 of lowerCharacters) {
            keys.push(c1 + c2);
        }
    }
    for (let c1 of upperCharacters) {
        for (let c2 of lowerCharacters) {
            keys.push(c1 + c2);
        }
    }
    for (let c1 of lowerCharacters) {
        for (let c2 of upperCharacters) {
            keys.push(c1 + c2);
        }
    }

    return <ReadonlyArray<string>>keys;
}

const memoized = moize(_getKeySet, {
    isSerialized: true,
    serializer: (args: ReadonlyArray<string>) => [JSON.stringify(args[0])],
});

export function getKeySet(customKeys: ReadonlyArray<string>) {
    return memoized(customKeys);
}
