describe('Lorem Ipsum Generator', () => {
    beforeEach(() => {
        cy.visit('/tools/lig')
    })

    it('should allow user to enter number of paragraphs', () => {
        cy.get('input').type('3')
    })

    it('should generate lorem ipsum text', () => {
        cy.get('input').type('3')
        cy.contains('Generate').click()
    })

    it('should populate textarea with generated lorem ipsum text', () => {
        cy.get('input').type('3')
        cy.contains('Generate').click()
        cy.get('textarea').invoke('val').should('not.be.empty');
    })

    it.skip('should copy generated text to user\'s clipboard', () => {
        //TODO: Cypress isn't great with async tests and/or clipboard data. This will be a WIP
        cy.get('input').type('3')
        cy.contains('Generate').click()
        cy.contains('Copy to Clipboard').click()

        let generatedText: string
        let clipboardText: string

        cy.get('textarea').invoke('text')
            .then(text => {
                generatedText = text;
            });

        cy.window().then(win => {
            win.navigator.clipboard.readText().then(text => {
                cy.log(text)
                clipboardText = text;
            })
        })

        // expect(clipboardText).to.eq(generatedText)
    })
})