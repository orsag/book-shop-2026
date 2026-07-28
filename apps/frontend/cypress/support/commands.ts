/// <reference types="cypress" />
// https://on.cypress.io/custom-commands

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    login(): Chainable<void>;
  }
}

Cypress.Commands.add('login', () => {
  // 1. Retrieve env variables using cy.env() FIRST
  cy.env(['USERNAME', 'PASSWORD']).then((env) => {
    const username = env['USERNAME'] || 'admin';
    const password = env['PASSWORD'] || 'admin';

    // 1. Immediately abort if username is 'admin'
    if (username === 'admin' || password === 'admin') {
      cy.log('🚨 Aborting test run: admin user is not permitted.');
      Cypress.stop(); // Halts execution instantly
      return;
    }

    // 2. Pass username to cy.session identifier
    cy.session([username], () => {
      // Set viewport matching Playwright setup
      cy.viewport(1920, 1080);

      cy.visit('/login');

      // Fill Login Form and Click Login
      cy.get('input[placeholder="User name"]').type(username);
      cy.get('input[placeholder="Password"]').type(password);

      cy.get('button[name="login"]').should('not.be.disabled').click();

      cy.wait(1000);

      // Wait for Successful Login & Page Ready
      // cy.url().should('not.include', '/login');
    }, {
      validate() {
        cy.getAllLocalStorage().then((storage) => {
          const originStorage = storage['http://localhost:4200'] || {};
          // Adjust key according to your app (e.g. 'token', 'auth', 'user')
          expect(Object.keys(originStorage).length).to.be.greaterThan(0);
        });
      }
    });
  });
});
