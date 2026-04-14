const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');

exports.uploadAssessmentFile = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    assessment.file = req.file.path;
    await assessment.save();

    res.json({ success: true, data: { filePath: req.file.path }, message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.uploadSubmissionFile = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.file = req.file.path;
    await submission.save();

    res.json({ success: true, data: { filePath: req.file.path }, message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.downloadFile = (req, res) => {
  const fileName = req.params.filename;
  const filePath = `uploads/${fileName}`;

  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  });
};