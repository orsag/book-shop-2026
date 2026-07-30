describe('GET /api/products/:id | POST /api/products/list | DELETE /api/products/:id', () => {
  let productIds: string[];
  let singleId: string;
  let adminToken: string;

  before(() => {
    cy.getTestProductIds().then((ids) => {
      productIds = ids;
      singleId = ids[0];
    });

    cy.apiLoginAsTestUser().then(({ accessToken, userId: id }) => {
      adminToken = accessToken;
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a product by ID with correct type', () => {
      cy.request('GET', `/api/products/${singleId}?type=GAME`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('id', singleId);
        expect(res.body).to.have.property('productType', 'GAME');
        expect(res.body).to.have.property('rating');
      });
    });

    it('includes typed details (gameDetails for GAME)', () => {
      cy.request('GET', `/api/products/${singleId}?type=GAME`).then((res) => {
        expect(res.body).to.have.property('gameDetails').that.is.an('object');
        expect(res.body.gameDetails).to.include.keys('category', 'brand');
      });
    });

    it('returns null body for non-existent ID', () => {
      cy.request({
        method: 'GET',
        url: '/api/products/non-existent-id',
        qs: { type: 'GAME' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });

  describe('POST /api/products/list', () => {
    it('returns products matching the given IDs', () => {
      cy.request('POST', '/api/products/list', { ids: productIds }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(productIds.length);

        const returnedIds = res.body.map((p: any) => p.id);
        expect(returnedIds).to.have.members(productIds);
      });
    });

    it('returns empty array when IDs array is empty', () => {
      cy.request('POST', '/api/products/list', { ids: [] }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.deep.eq([]);
      });
    });

    it('returns only matching products when mixed with invalid IDs', () => {
      cy.request('POST', '/api/products/list', {
        ids: [singleId, '00000000-0000-0000-0000-000000000000'],
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(1);
        expect(res.body[0].id).to.eq(singleId);
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('returns a structured response (success + message) with admin auth', () => {
      const deleteId = productIds[1];

      cy.request({
        method: 'DELETE',
        url: `/api/products/${deleteId}`,
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('success');
        expect(res.body).to.have.property('message');
      });
    });

    it('returns 401 without auth token', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/products/${singleId}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });
});
