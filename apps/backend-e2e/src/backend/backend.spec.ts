describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await fetch('/api');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: 'Hello API' });
  });
});
