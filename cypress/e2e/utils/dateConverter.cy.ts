import { unixEpochToDate } from '../../../src/utilities/UnixEpochToDate'

describe('Unix Epoch to Date', () => {
    beforeEach(() => {
        cy.visit('/tools/dates')
    })

    it('should allow the user to enter a timestamp', () => {
        cy.get('input')
            .filter(':visible')
            .type('I am the walrus')
    })

    it('displays the date strings', () => {
        const timestamp = '1674595801793'

        cy.get('input')
            .filter(':visible')
            .type(timestamp)

        const formattedDates = unixEpochToDate(parseInt(timestamp))
        cy.contains(`"iso":"${formattedDates.iso}"`)
        cy.contains(`"locale":"${formattedDates.locale}"`)
        cy.contains(`"human":"${formattedDates.human}"`)
    })
})