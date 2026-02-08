import range from 'lodash.range';
import moize from 'moize';

/**
 * Returns all possible command keys (a-z, A-Z, 0-9) as a fixed superset.
 * Used for command registration to ensure all keybindings have a handler,
 * regardless of customKeys setting.
 */
export function getAllCommandKeys() {
    const lowerCharacters = range(
        'a'.charCodeAt(0),
        'z'.charCodeAt(0) + 1
    ).map((c) => String.fromCharCode(c));

    const upperCharacters = range(
        'A'.charCodeAt(0),
        'Z'.charCodeAt(0) + 1
    ).map((c) => String.fromCharCode(c));

    const digitCharacters = range(
        '0'.charCodeAt(0),
        '9'.charCodeAt(0) + 1
    ).map((c) => String.fromCharCode(c));

    return {
        lowerCharacters: <ReadonlyArray<string>>lowerCharacters,
        upperCharacters: <ReadonlyArray<string>>upperCharacters,
        digitCharacters: <ReadonlyArray<string>>digitCharacters,
    };
}

export function getAllKeys(customKeys: ReadonlyArray<string>) {
    const isAlpha = (str: string) => /^[a-z]$/i.test(str);

    let lowerCharacters: Array<string> = [];
    let upperCharacters: Array<string> = [];
    let otherCharacters: Array<string> = [];

    if (!customKeys.length) {
        lowerCharacters = range(
            'a'.charCodeAt(0),
            'z'.charCodeAt(0) + 1 /* for inclusive*/
        ).map((c) => String.fromCharCode(c));

        upperCharacters = range(
            'A'.charCodeAt(0),
            'Z'.charCodeAt(0) + 1 /* for inclusive*/
        ).map((c) => String.fromCharCode(c));

        otherCharacters = range(
            '0'.charCodeAt(0),
            '9'.charCodeAt(0) + 1 /* for inclusive*/
        ).map((c) => String.fromCharCode(c));
    } else {
        for (const key of customKeys) {
            // check if key is an alpha character (as opposed to number or symbol)

            if (isAlpha(key)) {
                lowerCharacters.push(key.toLowerCase());
                upperCharacters.push(key.toUpperCase());
            } else {
                otherCharacters.push(key);
            }
        }
    }

    return {
        lowerCharacters: <ReadonlyArray<string>>lowerCharacters,
        upperCharacters: <ReadonlyArray<string>>upperCharacters,
        otherCharacters: <ReadonlyArray<string>>otherCharacters,
    };
}

function _getKeySet(customKeys: ReadonlyArray<string>) {
    const { lowerCharacters, upperCharacters, otherCharacters } =
        getAllKeys(customKeys);

    const keys: Array<string> = [];

    // Helper function to generate combinations between two sets
    const generateCombinations = (
        set1: ReadonlyArray<string>,
        set2: ReadonlyArray<string>
    ) => {
        for (const c1 of set1) {
            for (const c2 of set2) {
                keys.push(c1 + c2);
            }
        }
    };

    // Maintain the exact same order as the original implementation
    generateCombinations(lowerCharacters, lowerCharacters); // lower + lower
    generateCombinations(lowerCharacters, upperCharacters); // lower + upper
    generateCombinations(upperCharacters, lowerCharacters); // upper + lower
    generateCombinations(upperCharacters, upperCharacters); // upper + upper
    generateCombinations(lowerCharacters, otherCharacters); // lower + other
    generateCombinations(upperCharacters, otherCharacters); // upper + other
    generateCombinations(otherCharacters, lowerCharacters); // other + lower
    generateCombinations(otherCharacters, upperCharacters); // other + upper
    generateCombinations(otherCharacters, otherCharacters); // other + other

    return <ReadonlyArray<string>>keys;
}

const memoized = moize(_getKeySet, {
    isSerialized: true,
    serializer: (args: ReadonlyArray<string>) => [JSON.stringify(args[0])],
});

export function getKeySet(customKeys: ReadonlyArray<string>) {
    return memoized(customKeys);
}
