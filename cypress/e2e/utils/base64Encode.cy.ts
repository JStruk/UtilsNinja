import { Base64Encode } from '../../../src/utilities/Base64Encode'

describe('Base64 Encoder', () => {
    beforeEach(() => {
        cy.visit('/tools/base-64-encode')
    })

    const text: string = 'idk this is definitely some text'

    it('should allow the user to enter text to encode', () => {
        cy.get('textarea[aria-label="input-to-encode"]')
            .filter(':visible')
            .type(text)
    })

    it('should display the encoded text', () => {
        cy.get('textarea[aria-label="input-to-encode"]')
            .filter(':visible')
            .type(text)

        const encodedText: string = Base64Encode(text)
        cy.wait(310)
        cy.get('textarea[aria-label="encoded-text"]')
            .filter(':visible')
            .should('have.value', encodedText)
    })
})