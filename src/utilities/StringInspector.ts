type WordDistribution = Record<string, number>
export type InspectionResult = {
    characterCount: number
    wordCount: number
    nonWhitespaceCharacterCount: number
    lineCount: number
    wordDistribution: WordDistribution
}

export function inspect(string: String): InspectionResult {
    const words = string.split(/\s+/)
    const wordDistribution = words.reduce((carry: WordDistribution, word: string) => {
        carry[word] = (carry[word] || 0) + 1
        return carry
    }, {})

    return {
        characterCount: string.length,
        wordCount: words.length,
        nonWhitespaceCharacterCount: string.replace(/\s/g, '').length,
        lineCount: string.split(/[\n\r]/).length,
        wordDistribution,
    }
}