const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjects,
  createAssessment,
  getAssessments,
  getSubmissions,
  updateSubmissionStatus,
  addFeedback,
  getFeedbackTargets,
  deleteSubject,
  deleteAssessment,
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post(
  '/subjects',
  authMiddleware, roleMiddleware(['teacher']),
  createSubject
);

router.get(
  '/subjects',
  authMiddleware, roleMiddleware(['teacher']),
  getSubjects
);

router.delete(
  '/subjects/:id',
  authMiddleware, roleMiddleware(['teacher']),
  deleteSubject
);

router.post(
  '/assessments',
  authMiddleware, roleMiddleware(['teacher']),
  upload.single('file'),
  createAssessment
);

router.get(
  '/assessments',
  authMiddleware, roleMiddleware(['teacher']),
  getAssessments
);

router.delete(
  '/assessments/:id',
  authMiddleware, roleMiddleware(['teacher']),
  deleteAssessment
);

router.get(
  '/submissions',
  authMiddleware, roleMiddleware(['teacher']),
  getSubmissions
);

router.put(
  '/submissions/:id/status',
  authMiddleware, roleMiddleware(['teacher']),
  updateSubmissionStatus
);

router.get(
  '/feedback-targets',
  authMiddleware, roleMiddleware(['teacher']),
  getFeedbackTargets
);

router.post(
  '/submissions/:id/feedback',
  authMiddleware, roleMiddleware(['teacher']),
  addFeedback
);

module.exports = router;
