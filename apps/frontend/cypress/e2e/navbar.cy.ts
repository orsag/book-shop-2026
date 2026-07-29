describe('Navbar Component Tests', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist');
  });

  it('should toggle language to SK when language button is clicked', () => {
    // 1. Click data-testid="language-btn"
    cy.get('[data-testid="language-btn"]').click();

    // Check if <span title="language"> switched to 'SK'
    cy.get('span[title="language"]').should('have.text', 'SK');
  });

  it('should open profile modal and verify admin span when profile button is clicked', () => {
    // 2. Click data-testid="profile-btn"
    cy.get('[data-testid="profile-btn"]').click();

    // Check if data-testid="profile-modal" is visible
    cy.get('[data-testid="profile-modal"]').should('be.visible');

    // Check if <span title="admin"> and <span title="theme"> are visible
    cy.get('span[title="admin"]').should('be.visible');
    cy.get('span[title="theme"]').should('be.visible');
  });

  it('should open the modal window with corresponding item heading when first item is clicked', () => {
    // Target the first link in the footer grid
    cy.get('footer .grid button')
      .first()
      .then(($firstLink) => {
        // Extract expected heading string from the child span before clicking
        const expectedHeading = $firstLink.find('span').text().trim();

        // Perform user interaction step: Click the first link
        cy.wrap($firstLink).click();

        // Target the native dialog element / modal role
        cy.get('dialog[open] .modal-box').as('wipModal');

        // Verify that the modal element state switches to visible
        cy.get('@wipModal').should('be.visible');

        // Verify the modal heading content matches the extracted text (case-insensitive substring match)
        cy.get('@wipModal')
          .find('h3')
          .invoke('text')
          .then((headingText) => {
            expect(headingText.toLowerCase()).to.include(
              expectedHeading.toLowerCase(),
            );
          });

        // Locate the "Zatvoriť" button inside the dialog and click it
        cy.get('@wipModal').contains('button', 'Zatvoriť').click();

        // Assert that the modal is successfully hidden
        cy.get('@wipModal').should('not.exist');
      });
  });
});
