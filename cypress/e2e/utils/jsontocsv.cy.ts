import { JSONtoCSV } from '../../../src/utilities/JSONToCSV'


describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/json-to-csv')
    })

    it('should allow the user to type text into textarea', () => {
        cy.get('textarea[placeholder="JSON Data"]')
            .filter(':visible')
            .type('I am the walrus')
    })

    it('should accept user CSV and output converted JSON', () => {
        const JSONData = '[{"name": "John Doe", "age": "15"}]'

        cy.get('textarea[placeholder="JSON Data"]')
            .filter(':visible')
            .type(JSONData, { parseSpecialCharSequences: false })

        cy.wait(310)

        const expectedCSV = JSONtoCSV(JSONData)
        cy.get('textarea[placeholder="CSV format"]').invoke('val').should('equal', expectedCSV)
    })


    it('should return an empty array if the CSV data cannot be parsed', () => {
        cy.get('textarea[placeholder="JSON Data"]')
            .filter(':visible')
            .type('I am the walrus')

        cy.wait(310)
        cy.get('textarea[placeholder="CSV format"]')
            .filter(':visible')
            .invoke('val')
            .should('equal', '')
    })
})