import { CSVToJSON } from '../../../src/utilities/CSVToJSON'

describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/csv-to-json')
    })

    it('should allow the user to type text into textarea', () => {
        cy.get('textarea[placeholder="CSV Data"]').type('I am the walrus', { scrollBehavior: 'center' })
    })

    it('should accept user CSV and output converted JSON', () => {
        const CSVData = "Name,Age,Height\nJoe,25,5'10\nMike,30,6'0"

        cy.get('textarea[placeholder="CSV Data"]').type(CSVData, { scrollBehavior: 'center' })
        cy.get('button').contains('Convert').click()

        const expectedJSON = CSVToJSON(CSVData)
        cy.get('textarea[placeholder="JSON format"]').invoke('val').should('equal', expectedJSON)
    })

    it('should return an empty array if the CSV data cannot be parsed', () => {
        cy.get('textarea[placeholder="CSV Data"]').type('I am the walrus', { scrollBehavior: 'center' })
        cy.get('button').contains('Convert').click()
        cy.get('textarea[placeholder="JSON format"]').invoke('val').should('equal', '[]')
    })
})