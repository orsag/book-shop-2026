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

Cypress.Commands.add('apiLoginAsTestUser', (): Chainable<{ accessToken: string; userId: string }> => {
  const cachedToken = Cypress.env('testJwtToken');
  if (cachedToken) {
    cy.log('[AUTH]: Reusing cached test user JWT token.');
    return cy.wrap<{ accessToken: string; userId: string }>({
      accessToken: cachedToken,
      userId: Cypress.env('testUserId') as string,
    });
  }

  const username = Cypress.env('TEST_NAME') || 'testinguser';
  const password = Cypress.env('TEST_PASSWORD') || 'tester12345';

  return cy
    .api({
      method: 'POST',
      url: '/api/auth/login',
      body: { username, password },
    })
    .then((response) => {
      expect(response.status).to.eq(200);

      const token =
        response.body.accessToken ||
        response.body.token ||
        response.body.access_token;

      if (!token) {
        throw new Error(
          `Token could not be found in response body. Keys received: ${Object.keys(response.body).join(', ')}`,
        );
      }

      const userId = response.body.user.id;

      Cypress.env('testJwtToken', token);
      Cypress.env('testUserId', userId);
      cy.log('[AUTH]: Test user access token obtained and cached.');

      return cy.wrap<{ accessToken: string; userId: string }>({ accessToken: token, userId });
    });
});

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
