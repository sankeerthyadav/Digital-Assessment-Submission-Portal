const Subject = require('../models/Subject');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Feedback = require('../models/Feedback');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.createSubject = async (req, res) => {
  const { name } = req.body;
  const teacherId = req.user.id;

  try {
    const subject = new Subject({
      name,
      teacherId,
    });

    await subject.save();
    res.json({ success: true, data: subject, message: 'Subject created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subject, status, studentName, date } = req.query;
    const assessments = await Assessment.find({ createdBy: teacherId }).select("_id");
    const assessmentIds = assessments.map((assessment) => assessment._id);

    const query = { assessmentId: { $in: assessmentIds } };

    if (subject) {
      query.subjectId = subject;
    }

    if (status) {
      query.status = status;
    }

    if (studentName) {
      query.studentName = { $regex: studentName, $options: 'i' };
    }

    if (date) {
      const start = new Date(date);
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        query.submissionDate = { $gte: start, $lt: end };
      }
    }

    const submissions = await Submission.find(query)
      .populate("studentId", "name")
      .populate("subjectId", "name")
      .sort({ submissionDate: -1 });

    const formattedSubmissions = submissions.map((submission) => {
      const normalizedFilePath = (submission.file || '').replace(/\\/g, '/');
      const cleanPath = normalizedFilePath.startsWith('/') ? normalizedFilePath.slice(1) : normalizedFilePath;

      return {
        _id: submission._id,
        studentName: submission.studentName || submission.studentId?.name || 'Unknown Student',
        title: submission.title || null,
        subject: submission.subjectId?.name || null,
        submissionDate: submission.submissionDate,
        description: submission.description,
        filePath: normalizedFilePath,
        fileUrl: cleanPath ? `${req.protocol}://${req.get('host')}/${cleanPath}` : null,
        status: submission.status,
        rejectionReason: submission.rejectionReason || null,
        isChecked: Boolean(submission.isChecked),
      };
    });

    res.json({ success: true, data: formattedSubmissions, message: "Submissions retrieved successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateSubmissionStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const { id } = req.params;

  try {
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (status === "issue" && !rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required for 'issue' status" });
    }

    submission.status = status;
    submission.rejectionReason = rejectionReason || null;

    await submission.save();

    res.json({ success: true, data: submission, message: "Submission status updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.addFeedback = async (req, res) => {
  const { marks, grade, feedbackText } = req.body;
  const { id } = req.params; // submissionId

  try {
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    if (!submission.isChecked) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please mark submission as checked before giving feedback',
      });
    }

    let feedback = await Feedback.findOne({ submissionId: id });
    if (feedback) {
      return res.status(400).json({ success: false, message: "Feedback already exists for this submission" });
    }

    feedback = new Feedback({
      submissionId: id,
      marks,
      grade,
      feedbackText,
    });

    await feedback.save();
    res.json({ success: true, data: feedback, message: "Feedback added successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getFeedbackTargets = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assessments = await Assessment.find({ createdBy: teacherId }).select('_id');
    const assessmentIds = assessments.map((assessment) => assessment._id);

    const submissions = await Submission.find({ assessmentId: { $in: assessmentIds } })
      .populate('subjectId', 'name')
      .sort({ submissionDate: -1 });

    const submissionIds = submissions.map((submission) => submission._id);
    const feedbacks = await Feedback.find({ submissionId: { $in: submissionIds } }).select('submissionId marks grade feedbackText');

    const feedbackMap = feedbacks.reduce((acc, feedback) => {
      acc[String(feedback.submissionId)] = feedback;
      return acc;
    }, {});

    const targets = submissions.map((submission) => {
      const feedback = feedbackMap[String(submission._id)] || null;

      return {
        submissionId: submission._id,
        studentName: submission.studentName || 'Unknown Student',
        title: submission.title || null,
        subject: submission.subjectId?.name || null,
        submissionDate: submission.submissionDate,
        description: submission.description,
        status: submission.status,
        isChecked: Boolean(submission.isChecked),
        hasFeedback: Boolean(feedback),
        feedback: feedback
          ? {
              marks: feedback.marks,
              grade: feedback.grade,
              feedbackText: feedback.feedbackText,
            }
          : null,
      };
    });

    return res.json({ success: true, data: targets, message: 'Feedback targets retrieved successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};



exports.getAssessments = async (req, res) => {
  const { subject, page = 1, limit = 10 } = req.query;
  const createdBy = req.user.id;

  try {
    const query = { createdBy };
    if (subject) {
      query.subject = subject;
    }

    const assessments = await Assessment.find(query)
      .populate('subject', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Assessment.countDocuments(query);

    res.json({
      success: true,
      data: {
        assessments,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
      message: "Assessments retrieved successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacherId: req.user.id });
    res.json({ success: true, data: subjects, message: "Subjects retrieved successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createAssessment = async (req, res) => {
  const { subject, title, description, deadline } = req.body;
  const createdBy = req.user.id;

  try {
    const assessment = new Assessment({
      subject,
      title,
      description,
      deadline,
      createdBy,
      file: req.file ? req.file.path : null,
    });

    await assessment.save();
    res.json({ success: true, data: assessment, message: "Assessment created successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteSubject = async (req, res) => {
  const { id } = req.params;

  try {
    const subject = await Subject.findOne({ _id: id, teacherId: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, data: null, message: 'Subject not found' });
    }

    const linkedAssessment = await Assessment.findOne({ subject: id, createdBy: req.user.id }).select('_id');
    if (linkedAssessment) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cannot delete subject because it is linked to existing assessments',
      });
    }

    await Subject.deleteOne({ _id: id });
    return res.json({ success: true, data: { _id: id }, message: 'Subject deleted successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.deleteAssessment = async (req, res) => {
  const { id } = req.params;

  try {
    const assessment = await Assessment.findOne({ _id: id, createdBy: req.user.id });
    if (!assessment) {
      return res.status(404).json({ success: false, data: null, message: 'Assessment not found' });
    }

    const submissions = await Submission.find({ assessmentId: id }).select('_id');
    const submissionIds = submissions.map((submission) => submission._id);

    if (submissionIds.length > 0) {
      await Feedback.deleteMany({ submissionId: { $in: submissionIds } });
      await Submission.deleteMany({ assessmentId: id });
    }

    await Assessment.deleteOne({ _id: id });

    return res.json({ success: true, data: { _id: id }, message: 'Assessment deleted successfully' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.markSubmissionChecked = async (req, res) => {
  const { id } = req.params;

  try {
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, data: null, message: 'Submission not found' });
    }

    submission.isChecked = true;
    await submission.save();

    return res.json({
      success: true,
      data: submission,
      message: 'Submission marked as checked successfully',
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.exportSubmissionsCsv = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assessments = await Assessment.find({ createdBy: teacherId }).select('_id');
    const assessmentIds = assessments.map((assessment) => assessment._id);

    const submissions = await Submission.find({ assessmentId: { $in: assessmentIds } })
      .populate('subjectId', 'name')
      .populate('assessmentId', 'title')
      .sort({ submissionDate: -1 });

    const submissionIds = submissions.map((submission) => submission._id);
    const feedbacks = await Feedback.find({ submissionId: { $in: submissionIds } }).select(
      'submissionId marks grade'
    );

    const feedbackMap = feedbacks.reduce((acc, feedback) => {
      acc[String(feedback.submissionId)] = feedback;
      return acc;
    }, {});

    const escapeCsv = (value) => {
      const str = value == null ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const header = ['studentName', 'subject', 'assessmentTitle', 'status', 'marks', 'grade', 'submissionDate'];
    const rows = submissions.map((submission) => {
      const feedback = feedbackMap[String(submission._id)] || null;
      return [
        submission.studentName || '',
        submission.subjectId?.name || '',
        submission.assessmentId?.title || '',
        submission.status || '',
        feedback?.marks ?? '',
        feedback?.grade || '',
        submission.submissionDate ? new Date(submission.submissionDate).toISOString() : '',
      ];
    });

    const csvContent = [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};

exports.exportSubmissionsZip = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const assessments = await Assessment.find({ createdBy: teacherId }).select('_id');
    const assessmentIds = assessments.map((assessment) => assessment._id);

    const submissions = await Submission.find({ assessmentId: { $in: assessmentIds } })
      .populate('subjectId', 'name')
      .populate('assessmentId', 'title')
      .sort({ submissionDate: -1 });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (error) => {
      throw error;
    });

    archive.pipe(res);

    submissions.forEach((submission, index) => {
      const filePath = submission.file;
      if (!filePath) {
        console.error(`Skipping submission ${submission._id}: missing file path`);
        return;
      }

      const safeStudentName = (submission.studentName || 'student').replace(/\s+/g, '_');
      const safeTitle = (submission.assessmentId?.title || 'assessment').replace(/\s+/g, '_');

      const normalizedPath = filePath.replace(/\\/g, '/');
      const absolutePath = path.isAbsolute(normalizedPath)
        ? normalizedPath
        : path.join(__dirname, '..', normalizedPath);

      if (!fs.existsSync(absolutePath)) {
        console.error(`Skipping missing file for submission ${submission._id}: ${absolutePath}`);
        return;
      }

      const fileExtension = path.extname(absolutePath);
      const fileName = `${index + 1}_${safeStudentName}_${safeTitle}${fileExtension}`;

      archive.file(absolutePath, { name: fileName });
    });

    await archive.finalize();
    return null;
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
};
