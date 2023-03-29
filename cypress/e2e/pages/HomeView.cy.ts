import { slogan } from '../../../src/constants/Constants'

describe('HomeView', () => {
    it('shows the title', () => {
        cy.visit('/')
        cy.contains('.md\\:text-8xl', 'UtilsNinja')
    })

    it('shows the slogan', () => {
        cy.visit('/')
        cy.contains(slogan)
    })

    it('shows the CTA button', () => {
        cy.visit('/')
        cy.contains('View Tools')
    })

    it('allows the user to go to the Tools page via CTA button', () => {
        cy.visit('/')
        cy.contains('View Tools').click()

        cy.url().should('be.equal', `${Cypress.config('baseUrl')}/tools`)
    })

    it('allows the user to go to the Tools page via navbar', () => {
        cy.visit('/')
        cy.contains('Tools').click()

        cy.url().should('be.equal', `${Cypress.config('baseUrl')}/tools`)
    })
})