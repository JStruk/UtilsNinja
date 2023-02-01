import { unixEpochToDate } from '../../../src/utilities/unixEpochToDate';

describe('Unix Epoch to Date', () => {
    beforeEach(() => {
        cy.visit('/tools/dates')
    })

    it('should allow the user to enter a timestamp', () => {
        cy.get('input').type('I am the walrus')
    })

    it('displays the date strings', () => {
        const timestamp = '1674595801793';

        cy.get('input').type(timestamp);

        const formattedDates = unixEpochToDate(parseInt(timestamp));
        cy.contains(`"iso":"${formattedDates.iso}"`);
        cy.contains(`"locale":"${formattedDates.locale}"`);
        cy.contains(`"human":"${formattedDates.human}"`);
    });
})