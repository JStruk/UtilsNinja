describe('PHP Array To Json', () => {
    beforeEach(() => {
        cy.visit('/tools/php-to-json')
    })

    const key = 'tacos'
    const value = 'burritos'

    const phpArray = `["${key}" => "${value}"]`

    it('should allow the user to enter text', () => {
        cy.get('[aria-label="php-array-input"]').filter(':visible').type(phpArray)
    })

    it('should display the results of the inspected string', () => {
        cy.get('[aria-label="php-array-input"]').filter(':visible').type(phpArray)

        cy.wait(310)

        cy.contains(`"${key}":"${value}"`)
    })
})