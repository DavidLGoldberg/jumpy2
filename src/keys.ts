import range from 'lodash.range';
import moize from 'moize';

// Shared character ranges - single source of truth
const LOWER_CHARS: ReadonlyArray<string> = range(
    'a'.charCodeAt(0),
    'z'.charCodeAt(0) + 1
).map((c) => String.fromCharCode(c));

const UPPER_CHARS: ReadonlyArray<string> = range(
    'A'.charCodeAt(0),
    'Z'.charCodeAt(0) + 1
).map((c) => String.fromCharCode(c));

const DIGIT_CHARS: ReadonlyArray<string> = range(
    '0'.charCodeAt(0),
    '9'.charCodeAt(0) + 1
).map((c) => String.fromCharCode(c));

/**
 * Returns all possible command keys (a-z, A-Z, 0-9) as a fixed superset.
 * Used for command registration to ensure all keybindings have a handler,
 * regardless of customKeys setting.
 */
export function getAllCommandKeys() {
    return {
        lowerCharacters: LOWER_CHARS,
        upperCharacters: UPPER_CHARS,
        digitCharacters: DIGIT_CHARS,
    };
}

export function getAllKeys(customKeys: ReadonlyArray<string>) {
    const isAlpha = (str: string) => /^[a-z]$/i.test(str);
    const isDigit = (str: string) => /^[0-9]$/.test(str);

    if (!customKeys.length) {
        return {
            lowerCharacters: LOWER_CHARS,
            upperCharacters: UPPER_CHARS,
            digitCharacters: DIGIT_CHARS,
        };
    }

    const lowerCharacters: Array<string> = [];
    const upperCharacters: Array<string> = [];
    const digitCharacters: Array<string> = [];

    for (const key of customKeys) {
        if (isAlpha(key)) {
            lowerCharacters.push(key.toLowerCase());
            upperCharacters.push(key.toUpperCase());
        } else if (isDigit(key)) {
            digitCharacters.push(key);
        }
        // Non-alpha, non-digit characters are ignored
        // (they require custom keybindings in package.json to work)
    }

    return {
        lowerCharacters: <ReadonlyArray<string>>lowerCharacters,
        upperCharacters: <ReadonlyArray<string>>upperCharacters,
        digitCharacters: <ReadonlyArray<string>>digitCharacters,
    };
}

function _getKeySet(customKeys: ReadonlyArray<string>) {
    const { lowerCharacters, upperCharacters, digitCharacters } =
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
    generateCombinations(lowerCharacters, digitCharacters); // lower + digit
    generateCombinations(upperCharacters, digitCharacters); // upper + digit
    generateCombinations(digitCharacters, lowerCharacters); // digit + lower
    generateCombinations(digitCharacters, upperCharacters); // digit + upper
    generateCombinations(digitCharacters, digitCharacters); // digit + digit

    return <ReadonlyArray<string>>keys;
}

const memoized = moize(_getKeySet, {
    isSerialized: true,
    serializer: (args: ReadonlyArray<string>) => [JSON.stringify(args[0])],
});

export function getKeySet(customKeys: ReadonlyArray<string>) {
    return memoized(customKeys);
}
