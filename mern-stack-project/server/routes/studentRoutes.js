const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getAvailableAssessments,
  downloadAssessmentFile,
  createSubmission,
  getStudentSubmissions,
  getSubmissionFeedback,
  getStudentFeedbackList,
  deleteSubmission,
} = require('../controllers/studentController');
const upload = require('../middleware/uploadMiddleware');

router.get(
  '/assessments',
  authMiddleware, roleMiddleware(['student']),
  getAvailableAssessments
);

router.get(
  '/assessments/:id/download',
  authMiddleware, roleMiddleware(['student']),
  downloadAssessmentFile
);

router.post(
  '/submissions',
  authMiddleware, roleMiddleware(['student']),
  upload.single('file'),
  createSubmission
);

router.get(
  '/submissions',
  authMiddleware, roleMiddleware(['student']),
  getStudentSubmissions
);

router.delete(
  '/submissions/:id',
  authMiddleware, roleMiddleware(['student']),
  deleteSubmission
);

router.get(
  '/submissions/:id/feedback',
  authMiddleware, roleMiddleware(['student']),
  getSubmissionFeedback
);

router.get(
  '/feedback',
  authMiddleware, roleMiddleware(['student']),
  getStudentFeedbackList
);

module.exports = router;