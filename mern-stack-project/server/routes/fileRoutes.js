const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadAssessmentFile,
  uploadSubmissionFile,
  downloadFile,
} = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post(
  '/upload/assessment/:id',
  authMiddleware, roleMiddleware(['teacher']),
  upload.single('file'),
  uploadAssessmentFile
);

router.post(
  '/upload/submission/:id',
  authMiddleware, roleMiddleware(['student']),
  upload.single('file'),
  uploadSubmissionFile
);

router.get('/download/:filename', authMiddleware, downloadFile);

module.exports = router;