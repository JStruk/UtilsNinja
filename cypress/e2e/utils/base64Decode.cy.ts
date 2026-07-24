import { Base64Decode } from '../../../src/utilities/Base64Decode'

describe('Base64 Decoder', () => {
    beforeEach(() => {
        cy.visit('/tools/base-64-decode')
        cy.location('pathname').should('equal', '/tools/base-64-decode')
    })

    const text = 'Rm9vYmFy'

    it('decodes replaced input without relying on a fixed debounce wait', () => {
        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type(text)

        cy.get('textarea[readonly]')
            .should('be.visible')
            .and('have.value', Base64Decode(text))
    })
})
