import { inspect } from '../../../src/utilities/StringInspector'
import type { InspectionResult } from '../../../src/utilities/StringInspector'

describe('String Inspector', () => {
    beforeEach(() => {
        cy.visit('/tools/inspector')
        cy.location('pathname').should('equal', '/tools/inspector')
    })

    const sentence = 'this has \n four of the same word \r and that word is word word'


    it('updates the inspection statistics for replaced input', () => {
        cy.get('textarea[aria-label="string-inspector"]')
            .should('be.visible')
            .clear()
        cy.get('textarea[aria-label="string-inspector"]')
            .type(sentence)

        const inspectorResult: InspectionResult = inspect(sentence)

        cy.get('.vjs-tree')
            .should('contain.text', 'characterCount')
            .and('contain.text', String(inspectorResult.characterCount))
            .and('contain.text', 'wordCount')
            .and('contain.text', String(inspectorResult.wordCount))
            .and('contain.text', 'nonWhitespaceCharacterCount')
            .and('contain.text', String(inspectorResult.nonWhitespaceCharacterCount))
            .and('contain.text', 'lineCount')
            .and('contain.text', String(inspectorResult.lineCount))
    })

    it('shows the word distribution for the inspected string', () => {
        cy.get('textarea[aria-label="string-inspector"]')
            .should('be.visible')
            .clear()
        cy.get('textarea[aria-label="string-inspector"]')
            .type(sentence)

        const inspectorResult: InspectionResult = inspect(sentence)
        const distribution = inspectorResult.wordDistribution

        cy.get('.vjs-tree').should('contain.text', 'wordDistribution')
        Object.keys(distribution).forEach((word) => {
            cy.get('.vjs-tree')
                .should('contain.text', word)
                .and('contain.text', String(distribution[word]))
        })
    })
})
