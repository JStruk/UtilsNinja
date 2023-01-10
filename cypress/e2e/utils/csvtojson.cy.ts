import { convertCSVToJSON } from '../../../src/utilities/csvtojson';

describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/csvtojson')
    })

    it('should allow the user to type text into textarea', () => {
        cy.get('textarea[placeholder="CSV Data"]').type('I am the walrus')
    })

    it('should accept user CSV and output converted JSON', () => {
        const CSVData = "Name,Age,Height\nJoe,25,5'10\nMike,30,6'0"

        cy.get('textarea[placeholder="CSV Data"]').type(CSVData);
        cy.contains('Convert').click();

        const expectedJSON = convertCSVToJSON(CSVData);
        cy.get('textarea[placeholder="JSON format"]').invoke('val').should('equal', expectedJSON);
    });

    it('should return an empty array if the CSV data cannot be parsed', () => {
        cy.get('textarea[placeholder="CSV Data"]').type('I am the walrus');
        cy.contains('Convert').click();
        cy.get('textarea[placeholder="JSON format"]').invoke('val').should('equal', '[]');
    })
})