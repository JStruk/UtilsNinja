describe('Lorem Ipsum Generator', () => {
    beforeEach(() => {
        cy.visit('/tools/lig')
    })

    it('should allow user to enter number of paragraphs', () => {
        cy.get('input[type="number"]')
            .filter(':visible')
            .type('3')
    })

    it('should generate lorem ipsum text', () => {
        cy.get('input[type="number"]')
            .filter(':visible')
            .type('3')
        cy.contains('Generate').click()

        cy.get('[aria-label="generated-lorem-ipsum"]')
            .filter(':visible')
            .should('not.have.value', ':empty')
    })

    it('should populate textarea with generated lorem ipsum text', () => {
        cy.get('input[type="number"]')
            .filter(':visible')
            .type('3')
        cy.contains('Generate').click()
        cy.get('textarea').invoke('val').should('not.be.empty')
    })

    it.skip('should copy generated text to user\'s clipboard', () => {
        //TODO: Cypress isn't great with async tests and/or clipboard data. This will be a WIP
        cy.get('input').type('3')
        cy.contains('Generate').click()
        cy.contains('Copy to Clipboard').click()

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let generatedText: string
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let clipboardText: string

        cy.get('textarea').invoke('text')
            .then(text => {
                generatedText = text
            })

        cy.window().then(win => {
            win.navigator.clipboard.readText().then(text => {
                cy.log(text)
                clipboardText = text
            })
        })

        // expect(clipboardText).to.eq(generatedText)
    })
})