import { lineSort } from '../../../src/utilities/LineSort'

describe('LineSort', () => {
    beforeEach(() => {
        cy.visit('/tools/line-sort')
    })

    const text: string = 'c\nb\na'

    it('should allow the user to enter text to sort', () => {
        cy.get('textarea[aria-label="input-to-sort"]').type(text)
    })

    it('should display the sorted text', () => {
        cy.get('textarea[aria-label="input-to-sort"]').type(text)
        cy.get('button[aria-label="sort-button"]').click()
        const sortedText: string = lineSort(text)
        cy.get('textarea[aria-label="sorted-text"]').should('have.value', sortedText)
    })
})