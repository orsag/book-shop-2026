/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    api(
      options: Partial<Cypress.RequestOptions>,
    ): Chainable<Cypress.Response<any>>;

    apiLoginAsTestUser(): Chainable<{ userId: string }>;

    getTestProductIds(): Chainable<string[]>;
  }
}
