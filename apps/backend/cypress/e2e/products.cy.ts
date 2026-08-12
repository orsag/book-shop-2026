function calculateEffectivePrice(product: { price: number; discount?: number | null }): number {
  const discountMultiplier = 1 - (product.discount || 0);
  return product.price * discountMultiplier;
}

describe('GET /api/products — findAll', () => {
  const api = { method: 'GET', url: '/api/products' } as const;

  it('returns 200 with default query params', () => {
    cy.api(api).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('data').that.is.an('array');
      expect(res.body).to.have.property('meta');
      expect(res.body.meta).to.include({ page: 1 });

      for (const product of res.body.data) {
        expect(product.productType).to.eq('BOOK');
      }
    });
  });

  it('returns 200 with explicit defaults', () => {
    cy.api({
      ...api,
      qs: { type: 'BOOK', page: 1, limit: 12, isDiscounted: false },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.meta).to.include({ page: 1, total: res.body.meta.total });
    });
  });

  describe('type filter', () => {
    it('filters by BOOK', () => {
      cy.api({ ...api, qs: { type: 'BOOK' } }).then((res) => {
        for (const p of res.body.data) {
          expect(p.productType).to.eq('BOOK');
        }
      });
    });

    it('filters by GAME', () => {
      cy.api({ ...api, qs: { type: 'GAME' } }).then((res) => {
        for (const p of res.body.data) {
          expect(p.productType).to.eq('GAME');
        }
      });
    });

    it('filters by GASTRO', () => {
      cy.api({ ...api, qs: { type: 'GASTRO' } }).then((res) => {
        for (const p of res.body.data) {
          expect(p.productType).to.eq('GASTRO');
        }
      });
    });

    // it('filters by GIFT_CARD', () => {
    //   cy.api({ ...api, qs: { type: 'GIFT_CARD' } }).then((res) => {
    //     for (const p of res.body.data) {
    //       expect(p.productType).to.eq('GIFT_CARD');
    //     }
    //   });
    // });
  });

  describe('pagination', () => {
    it('respects limit', () => {
      cy.api({ ...api, qs: { limit: 3 } }).then((res) => {
        expect(res.body.data).to.have.length.at.most(3);
      });
    });

    it('paginates correctly with page and limit', () => {
      cy.api({ ...api, qs: { page: 1, limit: 5 } }).then((page1) => {
        expect(page1.body.data).to.have.length(5);

        cy.api({ ...api, qs: { page: 2, limit: 5 } }).then((page2) => {
          expect(page2.body.data).to.have.length(5);

          const ids1 = page1.body.data.map((p: any) => p.id);
          const ids2 = page2.body.data.map((p: any) => p.id);
          const overlap = ids1.filter((id: string) => ids2.includes(id));
          expect(overlap).to.be.empty;
        });
      });
    });

    it('returns meta with pagination info', () => {
      cy.api({ ...api, qs: { page: 1, limit: 10 } }).then((res) => {
        const { meta } = res.body;
        expect(meta).to.include.keys('total', 'page', 'lastPage', 'hasMore');
        expect(meta.page).to.eq(1);
        expect(meta.lastPage).to.be.at.least(1);
        expect(typeof meta.hasMore).to.eq('boolean');
      });
    });

    it('returns empty data for page beyond last', () => {
      cy.api({ ...api, qs: { page: 9999, limit: 12 } }).then((res) => {
        expect(res.body.data).to.be.empty;
        expect(res.body.meta.hasMore).to.be.false;
      });
    });
  });

  describe('isDiscounted', () => {
    it('returns only discounted products when true', () => {
      cy.api({ ...api, qs: { isDiscounted: true, limit: 5 } }).then(
        (res) => {
          for (const p of res.body.data) {
            expect(p.discount).to.be.gt(0);
          }
        },
      );
    });

    // it('returns all products when false', () => {
    //   cy.api({ ...api, qs: { isDiscounted: false } }).then((res) => {
    //     const hasNonDiscounted = res.body.data.some((p: any) => p.discount === 0);
    //     const hasDiscounted = res.body.data.some((p: any) => p.discount > 0);
    //     expect(res.status).to.eq(200);
    //   });
    // });
  });

  describe('search', () => {
    it('finds products by partial name match', () => {
      cy.api({ ...api, qs: { search: 'Frozen' } }).then((res) => {
        expect(res.body.data).to.not.be.empty;
        for (const p of res.body.data) {
          expect(p.name.toLowerCase()).to.include('froz');
        }
      });
    });

    it('returns empty array for gibberish search', () => {
      cy.api({ ...api, qs: { search: 'xyznonexistent999' } }).then((res) => {
        expect(res.body.data).to.be.empty;
        expect(res.body.meta.total).to.eq(0);
      });
    });
  });

  describe('category filter', () => {
    it('filters BOOKs by category', () => {
      cy.api({ ...api, qs: { type: 'BOOK', category: 'Fantasy' } }).then((res) => {
        for (const p of res.body.data) {
          expect(p.bookDetails.category).to.eq('Fantasy');
        }
      });
    });

    it('returns empty for non-matching category', () => {
      cy.api({ ...api, qs: { type: 'BOOK', category: 'NONEXISTENT_CAT_XYZ' } }).then((res) => {
        expect(res.body.data).to.be.empty;
      });
    });
  });

  describe('sorting', () => {
    it('sorts by price ascending', () => {
      cy.api({ ...api, qs: { sortBy: 'price_asc' } }).then((res) => {
        const prices = res.body.data.map(
          (p: any) => calculateEffectivePrice(p),
        );
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).to.be.at.least(prices[i - 1]);
        }
      });
    });

    it('sorts by price descending', () => {
      cy.api({ ...api, qs: { sortBy: 'price_desc' } }).then((res) => {
        const prices = res.body.data.map((p: any) =>
          calculateEffectivePrice(p),
        );
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).to.be.at.most(prices[i - 1]);
        }
      });
    });
  });

  describe('combined queries', () => {
    it('combines type, category, search, and sortBy', () => {
      cy.api({
        ...api,
        qs: {
          type: 'BOOK',
          category: 'Fiction',
          search: 'the',
          sortBy: 'price_asc',
          limit: 5,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        if (res.body.data.length > 0) {
          const prices = res.body.data.map((p: any) => p.price);
          for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).to.be.at.least(prices[i - 1]);
          }
        }
      });
    });

    it('combines type GAME with isDiscounted and sorting', () => {
      cy.api({
        ...api,
        qs: {
          type: 'GAME',
          isDiscounted: true,
          sortBy: 'price_desc',
          limit: 20,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        for (const p of res.body.data) {
          expect(p.productType).to.eq('GAME');
          expect(p.discount).to.be.gt(0);
        }
      });
    });
  });

  describe('response structure', () => {
    it('includes rating for each product', () => {
      cy.api({ ...api, qs: { limit: 5 } }).then((res) => {
        for (const p of res.body.data) {
          expect(p).to.have.property('rating');
          expect(p.rating).to.include.keys('ratingValue', 'ratingCount');
        }
      });
    });

    it('includes typed details based on productType', () => {
      cy.api({ ...api, qs: { type: 'BOOK', limit: 3 } }).then((res) => {
        for (const p of res.body.data) {
          expect(p).to.have.property('bookDetails').that.is.an('object');
          expect(p.bookDetails).to.include.keys('author', 'category', 'isbn');
        }
      });
    });
  });

  it('returns 200 with defaults when only type is provided', () => {
    cy.api({ ...api, qs: { type: 'GAME' } }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.meta).to.include({ page: 1, limit: 12 });
    });
  });
});
