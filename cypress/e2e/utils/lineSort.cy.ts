import { lineSort } from '../../../src/utilities/LineSort'

describe('LineSort', () => {
    beforeEach(() => {
        cy.visit('/tools/line-sort')
    })

    const text: string = 'c\nb\na'
    const duplicateText: string = 'c\nc\nc\nb\na'

    it('should allow the user to enter text to sort', () => {
        cy.get('textarea[aria-label="input-to-sort"]').type(text)
    })

    it('should display the sorted text', () => {
        cy.get('textarea[aria-label="input-to-sort"]').type(text)
        cy.get('button[aria-label="sort-button"]').click()
        const sortedText: string = lineSort(text, false)
        cy.get('textarea[aria-label="sorted-text"]').should('have.value', sortedText)
    })

    it('should remove duplicate lines and sort', () => {
        cy.get('textarea[aria-label="input-to-sort"]').type(duplicateText)
        cy.get('button[aria-label="sort-button"]').click()
        const sortedText: string = lineSort(duplicateText)
        cy.get('textarea[aria-label="sorted-text"]').should('have.value', sortedText)
    })

    it('should not remove duplicate lines if not selected', () => {
        cy.get('textarea[aria-label="input-to-sort"]').type(duplicateText)
        cy.get('input[aria-label="remove-duplicates-checkbox"]').click()
        cy.get('button[aria-label="sort-button"]').click()
        const sortedText: string = lineSort(duplicateText, false)
        cy.get('textarea[aria-label="sorted-text"]').should('have.value', sortedText)
    })
})