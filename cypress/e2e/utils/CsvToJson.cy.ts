import { convertCSVToJSON } from '../../../src/utilities/csvtojson';

describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/csvtojson')
    })

    it('should allow user to enter CSV data', () => {
        cy.get('textarea[placeholder = "CSV Data"]').type('name,phone,email\n' +
            'Yvonne Mason,(673) 488-5638,fusce.mollis@aol.net', { delay: 1 });
    })

    it('should convert CSV data to JSON', function () {
        const csvData = 'name,phone,email\n' +
            'Yvonne Mason,(673) 488-5638,fusce.mollis@aol.net\n' +
            'Wylie Atkins,1-846-704-4076,nunc.pulvinar@protonmail.ca\n' +
            'Martin Haynes,1-235-228-5159,mattis@google.edu\n' +
            'Garrett Mcneil,1-333-834-7477,justo@aol.couk\n' +
            'Caleb Mcintyre,(328) 427-4256,sit.amet@icloud.net'
        const expectedJsonData = convertCSVToJSON(csvData);

        cy.get('textarea[placeholder = "CSV Data"]').type(csvData, { delay: 1 });
        cy.contains('Convert').click()

        cy.get('textarea[readonly]').should('have.value', expectedJsonData);
    });
});