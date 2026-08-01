import { DEFAULT_MAX_LIMIT } from '@store/libs';

describe('Dashboard Layout & Components', () => {
  it('should display exact number of book list items and zero book cards in list view', () => {
    cy.visit('/');
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist');
    // 1. Verify number of app-book-list-item is equal to DEFAULT_MAX_LIMIT
    cy.get('app-book-list-item').should('have.length', DEFAULT_MAX_LIMIT);

    // 2. Verify number of app-book-card is zero
    cy.get('app-book-card').should('not.exist'); // or .should('have.length', 0)
  });

  it('should display double of products when Load more books', () => {
    cy.intercept('GET', '**/products*').as('getProducts');
    cy.visit('/');
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist');
    // 1. Click Load More
    cy.get('[data-testid="load-more"]').click();

    // 2. Wait for HTTP call to complete
    cy.wait('@getProducts')
      .its('response.statusCode')
      .should('be.oneOf', [200, 304]);

    // 3. Assert updated count
    cy.get('app-book-list-item').should('have.length', 2 * DEFAULT_MAX_LIMIT);
  });

  it('should add the first item to the cart', () => {
    cy.visit('/');
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist');

    const ADD_LABEL = 'Do košíka';
    const REMOVE_LABEL = 'Odobrať';

    // Target the first item (.first() or .eq(0)) and scope assertions/actions within it
    cy.get('app-book-list-item')
      .first()
      .should('be.visible')
      .find('[data-testid="add-to-cart"]')
      .should('be.visible')
      .and('have.text', ADD_LABEL)
      .click();

    cy.get('app-book-list-item')
      .first()
      .find('[data-testid="add-to-cart"]')
      .should('have.text', REMOVE_LABEL);
  });
});
