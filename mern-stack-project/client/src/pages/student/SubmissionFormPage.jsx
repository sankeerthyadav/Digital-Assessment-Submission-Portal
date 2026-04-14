import { useEffect, useMemo, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';

function SubmissionFormPage() {
  const { showToast } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ assessmentId: '', title: '', description: '', file: null });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const res = await api.get('/student/assessments');
        setAssessments(res?.data?.data || []);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load assessments', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAssessments();
  }, [showToast]);

  const selectedAssessment = useMemo(
    () => assessments.find((item) => item._id === form.assessmentId),
    [assessments, form.assessmentId]
  );

  const isSelectedAssessmentExpired = useMemo(() => {
    if (!selectedAssessment?.deadline) return false;
    return new Date() > new Date(selectedAssessment.deadline);
  }, [selectedAssessment]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!selectedAssessment) nextErrors.assessmentId = 'Assessment is required';
    if (!form.title.trim()) nextErrors.title = 'Assessment title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.file) nextErrors.file = 'Submission file is required';
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast('Please select assessment, enter title and description, and upload file', 'error');
      return;
    }

    if (isSelectedAssessmentExpired) {
      showToast('Deadline has passed. Submission not allowed.', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('assessmentId', selectedAssessment._id);
    payload.append('subjectId', selectedAssessment.subject?._id);
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('file', form.file);

    try {
      setSaving(true);
      const res = await api.post('/student/submissions', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(res?.data?.message || 'Submission uploaded successfully');
      setForm({ assessmentId: '', title: '', description: '', file: null });
      setErrors({});
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to submit assessment', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submission Form</h1>
        <p className="text-sm text-slate-500">Submit your work for an assessment.</p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading assessments...
        </div>
      ) : (
        <form onSubmit={onSubmit} className="max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Assessment</label>
            <select
              value={form.assessmentId}
              onChange={(e) => setForm((p) => ({ ...p, assessmentId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            >
              <option value="">Select assessment</option>
              {assessments.map((assessment) => (
                <option key={assessment._id} value={assessment._id}>
                  {assessment.subject?.name} - {new Date(assessment.deadline).toLocaleDateString()}
                  {new Date() > new Date(assessment.deadline) ? ' (Expired)' : ''}
                </option>
              ))}
            </select>
            {errors.assessmentId && <p className="mt-1 text-xs text-red-600">{errors.assessmentId}</p>}
            {isSelectedAssessmentExpired && (
              <p className="mt-1 text-xs font-medium text-red-600">Deadline has passed. Submission not allowed.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Assessment Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Enter assessment title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Submission File</label>
            <input
              type="file"
              onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
          </div>

          <button
            type="submit"
            disabled={saving || isSelectedAssessmentExpired}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Spinner size="sm" className="border-white/40 border-t-white" /> Uploading...
              </>
            ) : (
              'Submit Assessment'
            )}
          </button>
        </form>
      )}
    </section>
  );
}

export default SubmissionFormPage;