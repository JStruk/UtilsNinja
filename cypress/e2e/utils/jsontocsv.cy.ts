import { convertJSONtoCSV } from '../../../src/utilities/jsontocsv';


describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/jsontocsv')
    })

    it('should allow the user to type text into textarea', () => {
        cy.get('textarea[placeholder="CSV Data"]').type('I am the walrus')
    })

    it('should accept user CSV and output converted JSON', () => {
        const JSONData = '{"name": "John Doe", "age": "15"}'

        cy.get('textarea[placeholder="CSV Data"]').type(JSONData);
        cy.contains('Convert').click();

        const expectedCSV = convertJSONtoCSV(JSONData);
        cy.get('textarea[placeholder="JSON format"]').invoke('val').should('equal', expectedCSV);
    });

    //
    // it('should return an empty array if the CSV data cannot be parsed', () => {
    //     cy.get('textarea[placeholder="CSV Data"]').type('I am the walrus');
    //     cy.contains('Convert').click();
    //     cy.get('textarea[placeholder="JSON format"]').invoke('val').should('equal', '[]');
    // })
})