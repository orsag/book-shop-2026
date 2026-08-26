describe('Filter Component Tests', () => {
  beforeEach(() => {
    // cy.login();
    cy.visit('/');
    cy.get('.skeleton', { timeout: 20000 }).should('not.exist');

    // 3. Conditional check: Open filter if not visible
    cy.get('body').then(($body) => {
      // Check if filter component is currently visible in the DOM
      // ✅ Safe for Cypress, cleaner, and invisible to Tailwind's parser
      const isFilterVisible = $body
        .find('[data-testid="filter-component"]')
        .is(':visible');

      if (!isFilterVisible) {
        cy.get('[data-testid="logo-btn"]').click();
        cy.get('[data-testid="filter-component"]').should('be.visible', {
          timeout: 1000,
        });
      }
    });
  });

  it('should toggle layout and display grid main-layout when clicking layout button', () => {
    cy.get('[data-testid="layout-btn"]').should('be.visible');

    // 1. Switch to Grid
    cy.get('[data-testid="layout-btn"]').click();
    cy.get('[data-testid="main-layout-grid"]').should('be.visible');

    // 2. Switch back to List
    cy.get('[data-testid="layout-btn"]').click();
    cy.get('[data-testid="main-layout-list"]').should('be.visible');
  });

  it('should sort elements by price ascending when clicking price button', () => {
    cy.get('[data-testid="price-btn"]').click();

    // Wait for sorting skeleton re-render to complete
    cy.get('.skeleton').should('not.exist');

    // Extract price spans from the first two list items and compare as numbers
    cy.get('app-product-item').then(($items) => {
      const firstItemPriceText = $items
        .eq(0)
        .find('span[title="pricing"]')
        .text();
      const secondItemPriceText = $items
        .eq(1)
        .find('span[title="pricing"]')
        .text();

      // Clean out currencies/spaces and convert strings to floating numbers
      const price1 = parseFloat(
        firstItemPriceText.replace(/[^0-9.]/g, '') || '0',
      );
      const price2 = parseFloat(
        secondItemPriceText.replace(/[^0-9.]/g, '') || '0',
      );

      // Assert price ordering
      expect(price1).to.be.lte(price2);
    });
  });

  it('should display discount badges when clicking discount button', () => {
    cy.get('[data-testid="discount-btn"]').click();

    // Wait for skeleton re-render to complete
    cy.get('.skeleton').should('not.exist');

    // Grab the first item and verify it contains a visible discount span element
    cy.get('app-product-item')
      .first()
      .find('span[title="discount"]')
      .should('be.visible');
  });
});
