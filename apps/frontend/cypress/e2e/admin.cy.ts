describe('Administration Route Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/administration');
    cy.get('.skeleton').should('not.exist');
  });

  it('should display the correct page heading', () => {
    // Assert that the first h1 header renders exactly as expected
    cy.get('h1').first().should('have.text', 'Administrácia');

    cy.get('h2').first().contains(/katalóg/i);
  });
});
