describe('String Inspector', () => {
    beforeEach(() => {
        cy.visit('/tools/inspector')
    })

    const text = 'idk this is definitely some text';

    it('should allow the user to enter text', () => {
        cy.get('textarea').type(text)
    })
})