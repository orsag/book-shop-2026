/* eslint-disable cypress/unsafe-to-chain-command */

describe('Profile Route Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/profile');
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist');
  });

  it('should display the correct page heading', () => {
    // Assert that the header renders exactly as expected
    cy.get('h1').should('have.text', 'Editácia profilu');
  });

  it('should update all editable profile inputs and show a success toast', () => {
    cy.intercept('PATCH', '**/api/user-detail/*').as('updateUserDetail');
    // 1. Fill out all required personal and contact fields
    cy.get('#displayname').clear().type('John Doe Senior');
    cy.get('#email').clear().type('john.doe.updated@example.com');
    cy.get('#phone').clear().type('+421900123456');

    // 2. Fill out bio text area
    cy.get('#user-bio')
      .clear()
      .type('Just an avid book reader updating my bio context.');

    // 3. Fill out address information
    cy.get('#city').clear().type('Bratislava');
    cy.get('#addressLine1').clear().type('Hlavna ulica 45');

    // 4. Fill out billing records
    cy.get('#iban').clear().type('SK1234567890123456789012');
    cy.get('#taxId').clear().type('SK2021222324');

    // 5. Click the primary (Save) button
    cy.contains('button', 'Save').click();

    // 6. Target the dynamic toast component container and save as alias
    cy.get('[data-testid="toast-item"]').as('toastAlert');

    // 7. Verify visibility
    cy.get('@toastAlert').should('be.visible');

    // 8. Assert notification message
    cy.get('@toastAlert').should('contain.text', 'Update profile successful', {
      timeout: 10000,
    });

    // 9. Wait and verify the network call returns 200 OK
    cy.wait('@updateUserDetail').its('response.statusCode').should('eq', 200);
  });

  it('should display validation errors when required fields are cleared', () => {
    // 1. Clear fields to trigger validation errors
    cy.get('#email').clear();
    cy.get('#displayname').clear();
    cy.get('#addressLine1').clear();
    cy.get('#iban').clear();
    cy.get('#phone').clear();

    // 2. Click save or blur fields to force error display if validation requires interaction/touch
    cy.contains('button', 'Save').click();

    // 3. Assert that the correct error messages appear in the DOM
    cy.get('#email').parent().should('contain.text', 'Email is required');
    cy.get('#displayname')
      .parent()
      .should('contain.text', 'Display name is required');
    cy.get('#addressLine1')
      .parent()
      .should('contain.text', 'Street is required');
    cy.get('#iban').parent().should('contain.text', 'Iban is required');
    cy.get('#phone').parent().should('contain.text', 'Phone is required');
  });
});
