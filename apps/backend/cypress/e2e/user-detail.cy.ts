describe('User Detail CRUD', () => {
  let userId: string;

  beforeEach(() => {
    cy.apiLoginAsTestUser().then(({ userId: id }) => {
      userId = id;
    });
  });

  describe('GET /user-detail/:userId', () => {
    it('returns user detail for the logged-in user', () => {
      cy.api({
        method: 'GET',
        url: `/api/user-detail/${userId}`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('userId', userId);
        expect(res.body).to.include.keys(
          'displayName',
          'addressLine1',
          'city',
          'countryCode',
          'isPremium',
        );
      });
    });

    it('returns 401 without an authenticated session', () => {
      cy.clearCookies();
      cy.api({
        method: 'GET',
        url: `/api/user-detail/${userId}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  describe('GET /user-detail/premium/:userId', () => {
    it('returns premium status fields only', () => {
      cy.api({
        method: 'GET',
        url: `/api/user-detail/premium/${userId}`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.all.keys(
          'isPremium',
          'membershipStart',
          'membershipEnd',
        );
      });
    });
  });

  describe('PATCH /user-detail/:userId', () => {
    it('updates displayName and bio', () => {
      cy.api({
        method: 'PATCH',
        url: `/api/user-detail/${userId}`,
        body: {
          displayName: 'Updated Test Display Name',
          bio: 'This bio was updated via E2E test.',
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('userId', userId);
        expect(res.body.displayName).to.eq('Updated Test Display Name');
        expect(res.body.bio).to.eq('This bio was updated via E2E test.');
      });
    });
  });

  describe('DELETE /user-detail/:userId then POST /user-detail', () => {
    it('deletes the user detail record', () => {
      cy.api({
        method: 'DELETE',
        url: `/api/user-detail/${userId}`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('userId', userId);
      });
    });

    it('re-creates user detail via POST after deletion', () => {
      cy.api({
        method: 'POST',
        url: '/api/user-detail',
        body: {
          userId,
          displayName: 'Recreated Test User',
          addressLine1: '456 Recreated Street',
          city: 'Bratislava',
          countryCode: 'SK',
        },
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property('userId', userId);
        expect(res.body.displayName).to.eq('Recreated Test User');
        expect(res.body.addressLine1).to.eq('456 Recreated Street');
      });
    });

    it('confirm the re-created detail is readable via GET', () => {
      cy.api({
        method: 'GET',
        url: `/api/user-detail/${userId}`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('userId', userId);
        expect(res.body.displayName).to.eq('Recreated Test User');
      });
    });
  });
});