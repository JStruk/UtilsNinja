describe('PHP Array To Json', () => {
    beforeEach(() => {
        cy.visit('/tools/php-to-json')
    })

    const key = 'tacos'
    const value = 'burritos'

    const phpArray = `["${key}" => "${value}"]`

    it('should allow the user to enter text', () => {
        cy.get('.ace_text-input').first().type(phpArray, { force: true })
    })

    it('should display the results of the inspected string', () => {
        cy.get('.ace_text-input').first().type(phpArray, { force: true })

        cy.wait(310)

        cy.contains(`"${key}":"${value}"`)
    })
})