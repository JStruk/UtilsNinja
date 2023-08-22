import { Base64Encode } from '../../../src/utilities/Base64Encode'

describe('Base64 Encoder', () => {
    beforeEach(() => {
        cy.visit('/tools/base-64-encode')
    })

    const text: string = 'idk this is definitely some text'

    it('should allow the user to enter text to encode', () => {
        cy.get('textarea[aria-label="input-to-encode"]').type(text)
    })

    it('should display the encoded text', () => {
        cy.get('textarea[aria-label="input-to-encode"]').type(text)
        cy.get('button[aria-label="encode-text"]').click()
        const encodedText: string = Base64Encode(text)
        cy.get('textarea[aria-label="encoded-text"]').should('have.value', encodedText)
    })

})