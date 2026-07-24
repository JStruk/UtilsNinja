describe('Navigation', () => {
    it('shows the current dashboard and utility navigation at the app root', () => {
        cy.visit('/')

        cy.location('pathname').should('equal', '/')
        cy.get('header h1').should('have.text', 'Dashboard')
        cy.get('nav[aria-label="Utilities"]').should('be.visible')
        cy.get('#tool-search').should('be.visible')
    })

    it('redirects the tools index to the first canonical catalog route', () => {
        cy.visit('/tools')

        cy.location('pathname').should('equal', '/tools/json-formatter')
        cy.get('header h1').should('have.text', 'JSON Formatter')
    })

    it('supports representative canonical tool routes', () => {
        const routes = [
            { path: '/tools/csv-to-json', title: 'CSV to JSON' },
            { path: '/tools/lig', title: 'Lorem Ipsum' },
            { path: '/tools/cron-explorer', title: 'Cron Explorer' },
        ]

        routes.forEach(({ path, title }) => {
            cy.visit(path)
            cy.location('pathname').should('equal', path)
            cy.get('header h1').should('have.text', title)
            cy.title().should('equal', `${title} | UtilsNinja`)
        })
    })

    it('filters the sidebar catalog and follows the matching tool link', () => {
        cy.visit('/')

        cy.get('#tool-search').type('yaml')
        cy.get('nav[aria-label="Utilities"] a')
            .should('have.length', 1)
            .and('have.attr', 'href', '/tools/json-yaml')
            .click()

        cy.location('pathname').should('equal', '/tools/json-yaml')
        cy.get('header h1').should('have.text', 'JSON ↔ YAML')
    })

    it('opens the catalog drawer and navigates on a mobile viewport', () => {
        cy.viewport(390, 844)
        cy.visit('/')

        cy.get('button[aria-label="Open navigation"]').click()
        cy.get('[role="dialog"][aria-label="Utility navigation"]')
            .should('be.visible')
            .within(() => {
                cy.contains('a', 'CSV to JSON').click()
            })

        cy.location('pathname').should('equal', '/tools/csv-to-json')
        cy.get('[role="dialog"][aria-label="Utility navigation"]').should('not.exist')
    })
})
