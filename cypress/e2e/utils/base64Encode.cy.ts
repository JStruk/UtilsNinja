import { Base64Encode } from '../../../src/utilities/Base64Encode'

describe('Base64 Encoder', () => {
    beforeEach(() => {
        cy.visit('/tools/base-64-encode')
        cy.location('pathname').should('equal', '/tools/base-64-encode')
    })

    const text = 'idk this is definitely some text'

    it('encodes replaced input without relying on a fixed debounce wait', () => {
        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type(text)

        cy.get('textarea[readonly]')
            .should('be.visible')
            .and('have.value', Base64Encode(text))
    })
})
