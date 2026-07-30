describe('Order CRUD', () => {
  let authToken: string;
  let userId: string;
  let orderId: string;
  let productIds: string[];

  before(() => {
    cy.apiLoginAsTestUser().then(({ accessToken, userId: id }) => {
      authToken = accessToken;
      userId = id;
    });

    cy.getTestProductIds().then((ids) => {
      productIds = ids;
    });
  });

  describe('POST /order', () => {
    it('creates an order with valid product', () => {
      cy.request({
        method: 'POST',
        url: '/api/order',
        headers: { Authorization: `Bearer ${authToken}` },
        body: { items: [{ productId: productIds[0], quantity: 1 }] },
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('status', 'PENDING');
        expect(res.body).to.have.property('totalAmount').that.is.a('number');
        expect(res.body).to.have.property('userId', userId);
        expect(res.body.items).to.have.length(1);
        orderId = res.body.id;
      });
    });

    it('returns 400 for non-existent product', () => {
      cy.request({
        method: 'POST',
        url: '/api/order',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          items: [
            {
              productId: '00000000-0000-0000-0000-000000000000',
              quantity: 1,
            },
          ],
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it('returns 401 without auth token', () => {
      cy.request({
        method: 'POST',
        url: '/api/order',
        body: { items: [{ productId: productIds[0], quantity: 1 }] },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  describe('GET /order/user/:userId', () => {
    it('returns orders for the authenticated user', () => {
      cy.request({
        method: 'GET',
        url: `/api/order/user/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.at.least(1);
        const ids = res.body.map((o: any) => o.id);
        expect(ids).to.include(orderId);
      });
    });
  });

  describe('GET /order/:id', () => {
    it('returns the order by ID with items', () => {
      cy.request({
        method: 'GET',
        url: `/api/order/${orderId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('id', orderId);
        expect(res.body).to.have.property('userId', userId);
        expect(res.body.items).to.be.an('array');
        expect(res.body.items[0]).to.have.property('product');
      });
    });
  });

  describe('PATCH /order/:id/cancel', () => {
    it('cancels the order within 14-day window', () => {
      cy.request({
        method: 'PATCH',
        url: `/api/order/${orderId}/cancel`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('status', 'CANCELLED');
      });
    });
  });

  describe('PATCH /order/:id/status', () => {
    it('updates order status to PAID', () => {
      cy.request({
        method: 'PATCH',
        url: `/api/order/${orderId}/status`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { status: 'PAID' },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('status', 'PAID');
      });
    });
  });

  describe('DELETE /order/:id', () => {
    it('deletes the order', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/order/${orderId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('id', orderId);
      });
    });
  });

  describe('GET /order/all', () => {
    it('returns all orders as admin', () => {
      cy.request({
        method: 'GET',
        url: '/api/order/all',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
      });
    });
  });
});
