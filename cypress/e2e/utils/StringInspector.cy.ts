import { inspect, InspectionResult } from '../../../src/utilities/StringInspector'

describe('String Inspector', () => {
    beforeEach(() => {
        cy.visit('/tools/inspector')
    })

    const text = 'idk this is definitely some text'
    const sentence = 'this has \n four of the same word \r and that word is word word'


    it('should allow the user to enter text', () => {
        cy.get('textarea').type(text)
    })

    it('should display the results of the inspected string', () => {
        cy.get('textarea').type(sentence)

        const inspectorResult: InspectionResult = inspect(sentence)

        cy.contains(`"characterCount":${inspectorResult.characterCount}`)
        cy.contains(`"wordCount":${inspectorResult.wordCount}`)
        cy.contains(`"nonWhitespaceCharacterCount":${inspectorResult.nonWhitespaceCharacterCount}`)
        cy.contains(`"lineCount":${inspectorResult.lineCount}`)
    })

    it('should display the word distribution for the inspected string', function () {
        cy.get('textarea').type(sentence)

        const inspectorResult: InspectionResult = inspect(sentence)

        cy.contains('"wordDistribution":{')
        const distribution = inspectorResult.wordDistribution

        Object.keys(distribution).map((word) => {
            cy.contains(`"${word}":${distribution[word]}`)
        })
    })
})