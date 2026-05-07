const { Pool } = require('pg');
const { logger } = require('../middleware/logger');

// Datenbankverbindung (Connection Pool für Performance)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ──────────────────────────────────────────────
// POST /api/v1/students  → Student anlegen
// ──────────────────────────────────────────────
const createStudent = async (req, res) => {
  const { first_name, last_name, email, age, grade } = req.body;

  // Input Validierung
  if (!first_name || !last_name || !email) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'first_name, last_name and email are required',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO students (first_name, last_name, email, age, grade)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [first_name, last_name, email, age, grade]
    );

    const student = result.rows[0];
    logger.info('Student created', { studentId: student.id });

    return res.status(201).json({
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    // Unique Constraint verletzt (Email bereits vorhanden)
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A student with this email already exists',
      });
    }
    logger.error('Error creating student', { error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ──────────────────────────────────────────────
// GET /api/v1/students  → Alle Studenten
// ──────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students ORDER BY created_at DESC'
    );

    logger.info('Fetched all students', { count: result.rows.length });

    return res.status(200).json({
      message: 'Students retrieved successfully',
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    logger.error('Error fetching students', { error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ──────────────────────────────────────────────
// GET /api/v1/students/:id  → Ein Student
// ──────────────────────────────────────────────
const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Student with id ${id} not found`,
      });
    }

    logger.info('Student fetched', { studentId: id });
    return res.status(200).json({
      message: 'Student retrieved successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error fetching student', { id, error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ──────────────────────────────────────────────
// PUT /api/v1/students/:id  → Student aktualisieren
// ──────────────────────────────────────────────
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, age, grade } = req.body;

  if (!first_name && !last_name && !email && !age && !grade) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'At least one field must be provided to update',
    });
  }

  try {
    // Prüfen ob Student existiert
    const existing = await pool.query(
      'SELECT * FROM students WHERE id = $1', [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Student with id ${id} not found`,
      });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE students 
       SET first_name = $1, last_name = $2, email = $3, age = $4, grade = $5
       WHERE id = $6
       RETURNING *`,
      [
        first_name  || current.first_name,
        last_name   || current.last_name,
        email       || current.email,
        age         || current.age,
        grade       || current.grade,
        id,
      ]
    );

    logger.info('Student updated', { studentId: id });
    return res.status(200).json({
      message: 'Student updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A student with this email already exists',
      });
    }
    logger.error('Error updating student', { id, error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ──────────────────────────────────────────────
// DELETE /api/v1/students/:id  → Student löschen
// ──────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Student with id ${id} not found`,
      });
    }

    logger.info('Student deleted', { studentId: id });
    return res.status(200).json({
      message: 'Student deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Error deleting student', { id, error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};