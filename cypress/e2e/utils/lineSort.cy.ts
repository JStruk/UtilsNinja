import { lineSort } from '../../../src/utilities/LineSort'

describe('LineSort', () => {
    beforeEach(() => {
        cy.visit('/tools/line-sort')
        cy.location('pathname').should('equal', '/tools/line-sort')
    })

    const text = 'c\nb\na'
    const duplicateText = 'c\nc\nc\nb\na'

    it('sorts replaced input and retries until the debounced output is ready', () => {
        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type(text)

        cy.get('textarea[readonly]')
            .should('have.value', lineSort(text))
    })

    it('removes duplicate lines by default', () => {
        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type(duplicateText)

        cy.get('textarea[readonly]')
            .should('have.value', lineSort(duplicateText))
    })

    it('keeps duplicate lines when the option is turned off', () => {
        cy.get('textarea:not([readonly])')
            .should('be.visible')
            .clear()
        cy.get('textarea:not([readonly])')
            .type(duplicateText)

        cy.contains('span', 'Remove Duplicates')
            .parent()
            .find('button')
            .click()

        cy.get('textarea[readonly]')
            .should('have.value', lineSort(duplicateText, false))
    })
})
