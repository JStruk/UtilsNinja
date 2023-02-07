import { describe, it, expect } from 'vitest'
import { inspect } from '@/utilities/StringInspector';

describe('StringInspector', () => {
    it('returns the count of the characters in the string', () => {
        const string = 'abcde';

        expect(inspect(string).characterCount).toEqual(string.length)
    })

    it('returns the count of the characters in the string without whitespace', () => {
        const string = 'a b c d e';

        expect(inspect(string).nonWhitespaceCharacterCount).toEqual(5)
    })

    it('returns the count of words in the string', function () {
        const string = 'this has four words';

        expect(inspect(string).wordCount).toEqual(4)
    });

    it('returns the count of words in the string with weird whitespace', function () {
        const string = 'this    has \n four \t words';

        expect(inspect(string).wordCount).toEqual(4)
    });

    it('returns the count of lines in the string', function () {
        const string = 'this has \n four words \r and 5 tacos';

        expect(inspect(string).lineCount).toEqual(3)
    });

    it('returns word distribution for a sentence', function () {
        const string = 'this has different words has words';

        expect(inspect(string).wordDistribution).toEqual({
            'this': 1,
            'has': 2,
            'different': 1,
            'words': 2
        })
    });
})