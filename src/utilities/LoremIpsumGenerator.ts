import { LoremIpsum } from 'lorem-ipsum'

// Copied from 'lorem-ipsum/types/src/constants/units'
// compiler errors saying this file does not exist when imported
const UNIT_WORDS = 'words'
const UNIT_SENTENCES = 'sentences'
const UNIT_PARAGRAPHS = 'paragraphs'
type LoremUnit = 'words' | 'word' | 'sentences' | 'sentence' | 'paragraphs' | 'paragraph'

export function generate(unit: LoremUnit, numUnits: number): string {
    const loremIpsum = new LoremIpsum()

    console.log(unit)
    switch (unit) {
        case UNIT_WORDS:
            return loremIpsum.generateWords(numUnits)
        case UNIT_SENTENCES:
            return loremIpsum.generateSentences(numUnits)
        case UNIT_PARAGRAPHS:
            return loremIpsum.generateParagraphs(numUnits)
    }

    return 'Invalid options received. Please try again.'
}
