describe('CSV to JSON', () => {
    beforeEach(() => {
        cy.visit('/tools/csv-to-json')
        cy.location('pathname').should('equal', '/tools/csv-to-json')
    })

    it('converts replaced CSV input and renders the JSON fields', () => {
        const CSVData = 'Name,Age\nJoe,25\nMike,30'

        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type(CSVData)

        cy.contains('h3', 'Valid JSON Output').should('be.visible')
        cy.get('.vjs-tree')
            .should('contain.text', 'Name')
            .and('contain.text', 'Joe')
            .and('contain.text', 'Age')
            .and('contain.text', '30')
    })

    it('renders an empty JSON array for a header-only CSV document', () => {
        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type('Name,Age')

        cy.contains('h3', 'Valid JSON Output').should('be.visible')
        cy.get('.vjs-tree').should('contain.text', '[]')
    })
})
