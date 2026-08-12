const DEFAULT_TEST_EMAIL = 'test.user.108@gmail.com';

describe('Auth controller tests', () => {
  let authToken: string;
  let userId: string;

  before(() => {
    cy.apiLoginAsTestUser().then(({ accessToken, userId: id }) => {
      authToken = accessToken;
      userId = id;
    });
  });

  it('should authenticate user and return access token', () => {
    // Just verifying the login works and gives a token back
    expect(authToken).to.be.a('string');
    expect(userId).to.be.a('string');
    expect(authToken).to.not.be.empty;
    expect(userId).to.not.be.empty;
  });

  it('should get user data (GET /api/auth?username=testinguser)', () => {
    cy.api({
      method: 'GET',
      url: '/api/auth', // Maps to AuthController @Get()
      qs: { username: 'testinguser' },
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('email', DEFAULT_TEST_EMAIL);
    });
  });
});
