import { slogan } from '../../../src/constants/Constants'

describe('HomeView', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('shows the dashboard introduction', () => {
        cy.get('header h1').should('have.text', 'Dashboard')
        cy.contains('main h2', 'Welcome to UtilsNinja').should('be.visible')
        cy.contains('main p', slogan).should('be.visible')
    })

    it('shows featured catalog cards with canonical links', () => {
        cy.get('main a[href^="/tools/"]').should('have.length.greaterThan', 1)

        cy.contains('main a', 'JSON Formatter')
            .should('have.attr', 'href', '/tools/json-formatter')
        cy.contains('main a', 'HTTP Status Codes')
            .should('have.attr', 'href', '/tools/http-status-codes')
    })

    it('navigates through a featured tool card', () => {
        cy.contains('main a', 'JSON Formatter').click()

        cy.location('pathname').should('equal', '/tools/json-formatter')
        cy.get('header h1').should('have.text', 'JSON Formatter')
    })
})
