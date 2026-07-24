describe('PHP Array To Json', () => {
    beforeEach(() => {
        cy.visit('/tools/php-to-json')
        cy.location('pathname').should('equal', '/tools/php-to-json')
    })

    const key = 'tacos'
    const value = 'burritos'

    const phpArray = `["${key}" => "${value}"]`

    it('converts replaced PHP array editor content to JSON', () => {
        cy.get('.ace_text-input')
            .first()
            .type('{selectall}{backspace}', { force: true })
        cy.get('.ace_text-input')
            .first()
            .type(phpArray, { force: true, parseSpecialCharSequences: false })

        cy.contains('h3', 'Valid JSON Output').should('be.visible')
        cy.get('.vjs-tree')
            .should('contain.text', key)
            .and('contain.text', value)
    })
})
