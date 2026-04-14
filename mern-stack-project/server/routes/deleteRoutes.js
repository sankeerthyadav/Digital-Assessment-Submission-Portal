const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  deleteSubject,
  deleteAssessment,
  markSubmissionChecked,
  exportSubmissionsCsv,
  exportSubmissionsZip,
} = require('../controllers/teacherController');
const { deleteSubmission } = require('../controllers/studentController');

router.get('/submissions/export/csv', authMiddleware, roleMiddleware(['teacher']), exportSubmissionsCsv);
router.get('/submissions/export/zip', authMiddleware, roleMiddleware(['teacher']), exportSubmissionsZip);
router.delete('/subjects/:id', authMiddleware, roleMiddleware(['teacher']), deleteSubject);
router.delete('/assessments/:id', authMiddleware, roleMiddleware(['teacher']), deleteAssessment);
router.delete('/submissions/:id', authMiddleware, roleMiddleware(['student']), deleteSubmission);
router.patch('/submissions/:id/check', authMiddleware, roleMiddleware(['teacher']), markSubmissionChecked);

module.exports = router;