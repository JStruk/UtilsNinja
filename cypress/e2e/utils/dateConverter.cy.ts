import { unixEpochToDate } from '../../../src/utilities/UnixEpochToDate'

describe('Unix Epoch to Date', () => {
    beforeEach(() => {
        cy.visit('/tools/dates')
        cy.location('pathname').should('equal', '/tools/dates')
    })

    it('shows the current invalid state for non-numeric input', () => {
        cy.get('input[placeholder^="e.g."]')
            .should('be.visible')
            .type('I am the walrus')

        cy.contains('h3', 'Invalid Timestamp').should('be.visible')
    })

    it('displays the date strings', () => {
        const timestamp = '1674595801793'

        cy.get('input[placeholder^="e.g."]')
            .should('be.visible')
            .type(timestamp)

        const formattedDates = unixEpochToDate(Number(timestamp))
        cy.get('.vjs-tree')
            .should('contain.text', 'iso')
            .and('contain.text', formattedDates.iso)
            .and('contain.text', 'locale')
            .and('contain.text', formattedDates.locale)
            .and('contain.text', 'human')
            .and('contain.text', formattedDates.human)
    })
})
