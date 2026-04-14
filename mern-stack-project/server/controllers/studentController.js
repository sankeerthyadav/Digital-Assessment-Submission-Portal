const path = require('path');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

exports.getAvailableAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({})
      .select('title subject description deadline file')
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    const formatted = assessments.map((assessment) => ({
      _id: assessment._id,
      title: assessment.title,
      subject: assessment.subject,
      description: assessment.description,
      deadline: assessment.deadline,
      file: assessment.file,
      downloadUrl: `/api/student/assessments/${assessment._id}/download`,
    }));

    return res.json({
      success: true,
      data: formatted,
      message: 'Available assessments fetched successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.downloadAssessmentFile = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, data: null, message: 'Assessment not found' });
    }

    const normalizedPath = assessment.file.replace(/\\/g, '/');
    const filePath = path.join(__dirname, '..', normalizedPath);

    return res.download(filePath, (err) => {
      if (err) {
        return res.status(404).json({ success: false, data: null, message: 'File not found' });
      }
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.createSubmission = async (req, res) => {
  const { subjectId, assessmentId, description, title } = req.body;

  try {
    if (!subjectId || !assessmentId || !description || !description.trim() || !title || !title.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'subjectId, assessmentId, title and description are required',
      });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Submission file is required',
      });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, data: null, message: 'Assessment not found' });
    }

    if (new Date() > new Date(assessment.deadline)) {
      return res.status(400).json({ success: false, data: null, message: 'Deadline has passed' });
    }

    const student = await User.findById(req.user.id).select('name');
    if (!student) {
      return res.status(404).json({ success: false, data: null, message: 'Student not found' });
    }

    const submission = await Submission.create({
      studentId: req.user.id,
      studentName: student.name,
      assessmentId,
      subjectId,
      file: req.file.path,
      title: title.trim(),
      description: description.trim(),
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      data: submission,
      message: 'Submission uploaded successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .select('studentName subjectId assessmentId submissionDate description file status rejectionReason')
      .populate('subjectId', 'name')
      .populate('assessmentId', 'title')
      .sort({ submissionDate: -1 });

    const formatted = submissions.map((submission) => ({
      _id: submission._id,
      studentName: submission.studentName,
      subject: submission.subjectId,
      assessment: submission.assessmentId,
      submissionDate: submission.submissionDate,
      description: submission.description,
      file: submission.file,
      status: submission.status,
      rejectionReason: submission.status === 'issue' ? submission.rejectionReason : null,
    }));

    return res.json({
      success: true,
      data: formatted,
      message: 'Student submissions fetched successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.getSubmissionFeedback = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user.id,
    });

    if (!submission) {
      return res.status(404).json({ success: false, data: null, message: 'Submission not found' });
    }

    const feedback = await Feedback.findOne({ submissionId: req.params.id }).select(
      'marks grade feedbackText'
    );

    if (!feedback) {
      return res.status(404).json({ success: false, data: null, message: 'Feedback not found' });
    }

    return res.json({
      success: true,
      data: feedback,
      message: 'Feedback fetched successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.getStudentFeedbackList = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .select('_id assessmentId subjectId submissionDate')
      .populate('assessmentId', 'title')
      .populate('subjectId', 'name')
      .sort({ submissionDate: -1 });

    const submissionIds = submissions.map((submission) => submission._id);
    const feedbacks = await Feedback.find({ submissionId: { $in: submissionIds } }).select(
      'submissionId marks grade feedbackText'
    );

    const feedbackMap = feedbacks.reduce((acc, feedback) => {
      acc[String(feedback.submissionId)] = feedback;
      return acc;
    }, {});

    const list = submissions
      .map((submission) => {
        const feedback = feedbackMap[String(submission._id)];
        if (!feedback) return null;

        return {
          submissionId: submission._id,
          assessment: submission.assessmentId,
          subject: submission.subjectId,
          submissionDate: submission.submissionDate,
          marks: feedback.marks,
          grade: feedback.grade,
          feedbackText: feedback.feedbackText,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      data: list,
      message: 'Student feedback list fetched successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.deleteSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findOne({ _id: id, studentId: req.user.id });
    if (!submission) {
      return res.status(404).json({ success: false, data: null, message: 'Submission not found' });
    }

    await Feedback.deleteOne({ submissionId: id });
    await Submission.deleteOne({ _id: id });

    return res.json({ success: true, data: { _id: id }, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};