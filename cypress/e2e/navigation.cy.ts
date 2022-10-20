// https://docs.cypress.io/api/introduction/api.html

import { slogan } from "../../src/constants/constants";

describe('Navigation', () => {
    it('shows the homepage at the app root url', () => {
        cy.visit('/')
        cy.contains('.md\\:text-8xl', 'UtilsNinja')
    })

    it('can visit the tools page', () => {
        cy.visit('/tools')

        cy.url().should('be.equal', `${Cypress.config("baseUrl")}/tools`)

        // TODO: dynamically check for util tabs based on registry of utils
        cy.contains('JSON Format')
        cy.contains('Lorem Ipsum')
    })

    it('can visit the lorem ipsum generator page', () => {
        cy.visit('/tools/lig')

        cy.url().should('be.equal', `${Cypress.config("baseUrl")}/tools/lig`)

        cy.get('input')
        cy.get('textarea')
    })
})
