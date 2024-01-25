import { lineSort } from '../../../src/utilities/LineSort'

describe('LineSort', () => {
    beforeEach(() => {
        cy.visit('/tools/line-sort')
    })

    const text: string = 'c\nb\na'
    const duplicateText: string = 'c\nc\nc\nb\na'

    it('should allow the user to enter text to sort', () => {
        cy.get('textarea[aria-label="input-to-sort"]')
            .filter(':visible')
            .type(text)
    })

    it('should display the sorted text', () => {
        cy.get('textarea[aria-label="input-to-sort"]')
            .filter(':visible')
            .type(text)

        const sortedText: string = lineSort(text, false)
        cy.wait(310)
        cy.get('textarea[aria-label="sorted-text"]')
            .filter(':visible')
            .should('have.value', sortedText)
    })

    it('should remove duplicate lines and sort', () => {
        cy.get('textarea[aria-label="input-to-sort"]')
            .filter(':visible')
            .type(duplicateText)

        const sortedText: string = lineSort(duplicateText)
        cy.wait(310)
        cy.get('textarea[aria-label="sorted-text"]')
            .filter(':visible')
            .should('have.value', sortedText)
    })

    it('should not remove duplicate lines if not selected', () => {
        cy.get('textarea[aria-label="input-to-sort"]')
            .filter(':visible')
            .type(duplicateText)
        cy.get('input[aria-label="remove-duplicates-checkbox"]')
            .filter(':visible')
            .click()

        cy.wait(310)
        const sortedText: string = lineSort(duplicateText, false)
        cy.get('textarea[aria-label="sorted-text"]')
            .filter(':visible')
            .should('have.value', sortedText)
    })
})