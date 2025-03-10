const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('Auth API', () => {
  afterAll(async () => {
    // Limpa dados de teste e encerra a conexão
    await db.query('DELETE FROM users WHERE username = $1', ['testuser']);
    db.end();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpass', role: 'vendedor' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
