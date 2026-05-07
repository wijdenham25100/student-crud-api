const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// CRUD Routes
router.post('/',      createStudent);    // Erstellen
router.get('/',       getAllStudents);   // Alle lesen
router.get('/:id',    getStudentById);  // Einen lesen
router.put('/:id',    updateStudent);   // Aktualisieren
router.delete('/:id', deleteStudent);   // Löschen

module.exports = router;