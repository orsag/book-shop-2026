/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    apiLoginAsTestUser(): Chainable<{ accessToken: string; userId: string }>;

    getTestProductIds(): Chainable<string[]>;
  }
}
