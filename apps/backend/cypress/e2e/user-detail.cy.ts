describe('User Detail CRUD', () => {
  let authToken: string;
  let userId: string;

  before(() => {
    cy.apiLoginAsTestUser().then(({ accessToken, userId: id }) => {
      authToken = accessToken;
      userId = id;
    });
  });

  describe('GET /user-detail/:userId', () => {
    it('returns user detail for the logged-in user', () => {
      cy.request({
        method: 'GET',
        url: `/api/user-detail/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
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

    it('returns 401 without auth token', () => {
      cy.request({
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
      cy.request({
        method: 'GET',
        url: `/api/user-detail/premium/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
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
      cy.request({
        method: 'PATCH',
        url: `/api/user-detail/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
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
      cy.request({
        method: 'DELETE',
        url: `/api/user-detail/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('userId', userId);
      });
    });

    it('re-creates user detail via POST after deletion', () => {
      cy.request({
        method: 'POST',
        url: '/api/user-detail',
        headers: { Authorization: `Bearer ${authToken}` },
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
      cy.request({
        method: 'GET',
        url: `/api/user-detail/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('userId', userId);
        expect(res.body.displayName).to.eq('Recreated Test User');
      });
    });
  });
});
