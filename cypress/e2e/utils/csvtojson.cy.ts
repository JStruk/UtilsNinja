import { CSVToJSON } from '../../../src/utilities/CSVToJSON'

describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/csv-to-json')
    })

    it('should allow the user to type text into textarea', () => {
        cy.get('textarea[placeholder="CSV Data"]')
            .filter(':visible')
            .type('I am the walrus', { scrollBehavior: 'center' })
    })

    it.skip('should accept user CSV and output converted JSON', () => {
        const CSVData = "Name,Age,Height\nJoe,25,5'10\nMike,30,6'0"

        cy.get('textarea[placeholder="CSV Data"]')
            .filter(':visible')
            .type(CSVData, { scrollBehavior: 'center' })

        const expectedJSON = CSVToJSON(CSVData)
        cy.wait(310)

        // not sure how to assert the code editor's value
        cy.get('.vjs-tree')
            // .filter(':visible')
            // .invoke('val')
            .contains(JSON.stringify('"Name:"'))
    })

    it.skip('should return an empty array if the CSV data cannot be parsed', () => {
        cy.get('textarea[placeholder="CSV Data"]')
            .filter(':visible')
            .type('I am the walrus', { scrollBehavior: 'center' })

        cy.wait(310)

        // not sure how to assert the code editor's value
        cy.get('textarea[placeholder="JSON format"]')
            .filter(':visible')
            .invoke('val')
            .should('equal', '[]')
    })
})