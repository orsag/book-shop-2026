const DEFAULT_TEST_EMAIL = 'test.user.108@gmail.com';

describe('Auth controller tests', () => {
  let userId: string;

  beforeEach(() => {
    cy.apiLoginAsTestUser().then(({ userId: id }) => {
      userId = id;
    });
  });

  it('should authenticate the test user via httpOnly cookie', () => {
    expect(userId).to.be.a('string');
    expect(userId).to.not.be.empty;
  });

  it('should get user data (GET /api/auth?username=testinguser)', () => {
    cy.api({
      method: 'GET',
      url: '/api/auth', // Maps to AuthController @Get()
      qs: { username: 'testinguser' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('email', DEFAULT_TEST_EMAIL);
    });
  });
});