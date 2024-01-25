import { Base64Decode } from '../../../src/utilities/Base64Decode'

describe('Base64 Decoder', () => {
    beforeEach(() => {
        cy.visit('/tools/base-64-decode')
    })

    const text: string = 'Rm9vYmFy'

    it('should allow the user to enter text to decode', () => {
        cy.get('textarea[aria-label="input-to-decode"]')
            .filter(':visible')
            .type(text)
    })

    it('should display the decoded text', () => {
        cy.get('textarea[aria-label="input-to-decode"]')
            .filter(':visible')
            .type(text)

        const decodedText: string = Base64Decode(text)
        cy.wait(310)

        cy.get('textarea[aria-label="decoded-text"]')
            .filter(':visible')
            .should('have.value', decodedText)
    })

})