describe('GET /api/products/:id | POST /api/products/list | DELETE /api/products/:id', () => {
  let productIds: string[];
  let singleId: string;

  before(() => {
    cy.getTestProductIds().then((ids) => {
      productIds = ids;
      singleId = ids[0];
    });
  });

  beforeEach(() => {
    cy.apiLoginAsTestUser();
  });

  describe('GET /api/products/:id', () => {
    it('returns a product by ID with correct type', () => {
      cy.api({ method: 'GET', url: `/api/products/${singleId}?type=GAME` }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('id', singleId);
        expect(res.body).to.have.property('productType', 'GAME');
        expect(res.body).to.have.property('rating');
      });
    });

    it('includes typed details (gameDetails for GAME)', () => {
      cy.api({ method: 'GET', url: `/api/products/${singleId}?type=GAME` }).then((res) => {
        expect(res.body).to.have.property('gameDetails').that.is.an('object');
        expect(res.body.gameDetails).to.include.keys('category', 'brand');
      });
    });

    it('returns null body for non-existent ID', () => {
      cy.api({
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
      cy.api({ method: 'POST', url: '/api/products/list', body: { ids: productIds } }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(productIds.length);

        const returnedIds = res.body.map((p: any) => p.id);
        expect(returnedIds).to.have.members(productIds);
      });
    });

    it('returns empty array when IDs array is empty', () => {
      cy.api({ method: 'POST', url: '/api/products/list', body: { ids: [] } }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.deep.eq([]);
      });
    });

    it('returns only matching products when mixed with invalid IDs', () => {
      cy.api({
        method: 'POST',
        url: '/api/products/list',
        body: {
          ids: [singleId, '00000000-0000-0000-0000-000000000000'],
        },
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

      cy.api({
        method: 'DELETE',
        url: `/api/products/${deleteId}`,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('success');
        expect(res.body).to.have.property('message');
      });
    });

    it('returns 401 without an authenticated session', () => {
      cy.clearCookies();
      cy.api({
        method: 'DELETE',
        url: `/api/products/${singleId}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });
});