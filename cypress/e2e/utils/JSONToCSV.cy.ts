import { JSONtoCSV } from '../../../src/utilities/JSONToCSV'

describe('JSON to CSV', () => {
    beforeEach(() => {
        cy.visit('/tools/json-to-csv')
        cy.location('pathname').should('equal', '/tools/json-to-csv')
    })

    it('converts replaced JSON editor content to CSV', () => {
        const JSONData = '[{"name": "John Doe", "age": "15"}]'

        cy.get('.ace_text-input')
            .first()
            .type('{selectall}{backspace}', { force: true })
        cy.get('.ace_text-input')
            .first()
            .type(JSONData, { force: true, parseSpecialCharSequences: false })

        cy.get('textarea[readonly]')
            .should('have.value', JSONtoCSV(JSONData))
    })

    it('shows the current invalid state for malformed JSON', () => {
        cy.get('.ace_text-input')
            .first()
            .type('{selectall}{backspace}', { force: true })
        cy.get('.ace_text-input')
            .first()
            .type('not valid JSON', { force: true })

        cy.contains('h3', 'Invalid JSON').should('be.visible')
        cy.get('textarea[readonly]').should('have.value', '')
    })
})
