/// <reference types="cypress" />

import Chainable = Cypress.Chainable;

/**
 * Unwraps the backend ApiResponse envelope ({ data, timestamp, statusCode })
 * the same way the frontend ApiService does, yielding res.body.data.
 */
const unwrap = (body: any): any =>
  body && typeof body === 'object' && 'data' in body ? body.data : body;

Cypress.Commands.add(
  'api',
  (
    options: Partial<Cypress.RequestOptions>,
  ): Chainable<Cypress.Response<any>> =>
    cy.request(options as Cypress.RequestOptions).then((res) => ({
      ...res,
      body: unwrap(res.body),
    })),
);

/**
 * Authenticates as the test user via the httpOnly `access_token` cookie.
 *
 * The login endpoint no longer returns a token in the body (JWT lives in an
 * httpOnly cookie, sent automatically on every request). `cy.session` caches
 * the authenticated browser state so the login POST only happens once per
 * spec run; subsequent tests restore the cookie from Cypress's session cache.
 */
Cypress.Commands.add(
  'apiLoginAsTestUser',
  (): Chainable<{ userId: string }> => {
    const username = Cypress.env('TEST_NAME') || 'testinguser';
    const password = Cypress.env('TEST_PASSWORD') || 'tester12345';

    return cy
      .session(
        ['api-test-user', username],
        () => {
          cy.api({
            method: 'POST',
            url: '/api/auth/login',
            body: { username, password },
          }).then((response) => {
            expect(response.status).to.eq(200);
            const userId = response.body.user.id;
            Cypress.env('testUserId', userId);
          });
        },
        {
          validate() {
            cy.getCookie('access_token').should('exist');
          },
        },
      )
      .then(() => {
        cy.log('[AUTH]: Test user session established via httpOnly cookie.');
        return cy.wrap<{ userId: string }>({
          userId: Cypress.env('testUserId') as string,
        });
      });
  },
);

Cypress.Commands.add('getTestProductIds', (): Chainable<string[]> => {
  return cy
    .api({
      method: 'GET',
      url: '/api/products',
      qs: { type: 'GAME', page: 1, limit: 12, isDiscounted: false },
    })
    .then((res) => {
      const ids = res.body.data.map((p: any) => p.id);
      expect(ids).to.not.be.empty;
      return cy.wrap<string[]>(ids);
    });
});