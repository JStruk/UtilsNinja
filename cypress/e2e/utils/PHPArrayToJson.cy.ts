import { PHPArrayToJson } from '../../../src/utilities/PHPArrayToJson';

describe('PHP Array To Json', () => {
    beforeEach(() => {
        cy.visit('/tools/php-to-json')
    })

    const key = 'tacos'
    const value = 'burritos'

    const phpArray = `["${key}" => "${value}"]`

    it('should allow the user to enter text', () => {
        cy.get('textarea').type(phpArray)
    })

    it('should display the results of the inspected string', () => {
        cy.get('textarea').type(phpArray)

        cy.contains('Convert').click()

        cy.contains(`"${key}":"${value}"`)
    })
})