import { JSONtoCSV } from '../../../src/utilities/JSONToCSV';


describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/jsontocsv')
    })

    it('should allow the user to type text into textarea', () => {
        cy.get('textarea[placeholder="JSON Data"]').type('I am the walrus')
    })

    it('should accept user CSV and output converted JSON', () => {
        const JSONData = '[{"name": "John Doe", "age": "15"}]'

        cy.get('textarea[placeholder="JSON Data"]').type(JSONData, { parseSpecialCharSequences: false });
        cy.contains('Convert').click();

        const expectedCSV = JSONtoCSV(JSONData);
        cy.get('textarea[placeholder="CSV format"]').invoke('val').should('equal', expectedCSV);
    });


    it('should return an empty array if the CSV data cannot be parsed', () => {
        cy.get('textarea[placeholder="JSON Data"]').type('I am the walrus');
        cy.contains('Convert').click();
        cy.get('textarea[placeholder="CSV format"]').invoke('val').should('equal', '');
    });
})