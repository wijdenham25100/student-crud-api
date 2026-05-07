const request = require('supertest');
const app = require('../app');

// Mock der Datenbank – wir testen nur die API-Logik, nicht die DB
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

const { Pool } = require('pg');
const mockPool = new Pool();

describe('Student API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Healthcheck ──────────────────────────────
  describe('GET /healthcheck', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/healthcheck');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  // ── Create Student ───────────────────────────
  describe('POST /api/v1/students', () => {
    it('should create a new student', async () => {
      const newStudent = {
        id: 'test-uuid',
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        age: 22,
        grade: 'A',
      };
      mockPool.query.mockResolvedValueOnce({ rows: [newStudent] });

      const res = await request(app)
        .post('/api/v1/students')
        .send({ first_name: 'Max', last_name: 'Mustermann', email: 'max@example.com', age: 22, grade: 'A' });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('max@example.com');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/students')
        .send({ first_name: 'Max' }); // email fehlt

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad Request');
    });
  });

  // ── Get All Students ─────────────────────────
  describe('GET /api/v1/students', () => {
    it('should return all students', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: '1', first_name: 'Anna', email: 'anna@test.com' }],
      });

      const res = await request(app).get('/api/v1/students');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── Get Student by ID ────────────────────────
  describe('GET /api/v1/students/:id', () => {
    it('should return 404 for unknown student', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/v1/students/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });

    it('should return a student by id', async () => {
      const student = { id: 'abc', first_name: 'Lisa', email: 'lisa@test.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [student] });

      const res = await request(app).get('/api/v1/students/abc');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('abc');
    });
  });

  // ── Delete Student ───────────────────────────
  describe('DELETE /api/v1/students/:id', () => {
    it('should delete a student', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 'abc' }] });

      const res = await request(app).delete('/api/v1/students/abc');

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});