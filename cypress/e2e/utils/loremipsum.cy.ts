describe('Lorem Ipsum Generator', () => {
    beforeEach(() => {
        cy.visit('/tools/lig')
        cy.location('pathname').should('equal', '/tools/lig')
    })

    it('accepts a generation amount', () => {
        cy.get('input[type="number"]')
            .should('be.visible')
            .clear()
        cy.get('input[type="number"]')
            .type('3')
        cy.get('input[type="number"]')
            .should('have.value', '3')
    })

    it('generates the selected kind of lorem ipsum', () => {
        cy.get('input[type="number"]')
            .should('be.visible')
            .clear()
        cy.get('input[type="number"]')
            .type('3')
        cy.contains('button', 'paragraphs').click()
        cy.contains('Generate').click()

        cy.get('textarea[readonly]')
            .should('be.visible')
            .and('not.have.value', '')
    })
})
