import { useEffect, useMemo, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/ToastProvider';

function TeacherFeedbackPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [targets, setTargets] = useState([]);
  const [forms, setForms] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const loadTargets = async () => {
      setLoading(true);
      try {
        const res = await api.get('/teacher/feedback-targets');
        const list = res?.data?.data || [];
        setTargets(list);

        const initialForms = list.reduce((acc, item) => {
          acc[item.submissionId] = {
            marks: item.feedback?.marks ?? '',
            grade: item.feedback?.grade ?? '',
            feedbackText: item.feedback?.feedbackText ?? '',
          };
          return acc;
        }, {});
        setForms(initialForms);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load feedback targets', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadTargets();
  }, [showToast]);

  const totalPages = Math.max(Math.ceil(targets.length / pageSize), 1);

  const paginatedTargets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return targets.slice(start, start + pageSize);
  }, [page, targets]);

  const onFormChange = (submissionId, key, value) => {
    setForms((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [key]: value,
      },
    }));
  };

  const onSubmitFeedback = async (submissionId) => {
    const form = forms[submissionId] || {};
    const marks = Number(form.marks);
    const grade = (form.grade || '').trim();
    const feedbackText = (form.feedbackText || '').trim();

    if (Number.isNaN(marks) || marks < 0) {
      showToast('Marks must be a valid non-negative number', 'error');
      return;
    }
    if (!grade) {
      showToast('Grade is required', 'error');
      return;
    }
    if (!feedbackText) {
      showToast('Feedback text is required', 'error');
      return;
    }

    try {
      setSavingId(submissionId);
      const res = await api.post(`/teacher/submissions/${submissionId}/feedback`, {
        marks,
        grade,
        feedbackText,
      });

      showToast(res?.data?.message || 'Feedback submitted successfully');

      setTargets((prev) =>
        prev.map((item) =>
          item.submissionId === submissionId
            ? {
                ...item,
                hasFeedback: true,
                feedback: { marks, grade, feedbackText },
              }
            : item
        )
      );
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSavingId('');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Teacher Feedback</h1>
        <p className="text-sm text-slate-500">Provide marks, grade, and feedback for reviewed submissions.</p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading submissions...
        </div>
      ) : targets.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No submissions available for feedback.
        </p>
      ) : (
        <div className="space-y-4">
          {paginatedTargets.map((item) => {
            const form = forms[item.submissionId] || { marks: '', grade: '', feedbackText: '' };
            const isUnchecked = !item.isChecked;

            return (
              <article key={item.submissionId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                  <p><span className="font-medium text-slate-900">Student:</span> {item.studentName || '-'}</p>
                  <p><span className="font-medium text-slate-900">Assessment Title:</span> {item.title || 'N/A'}</p>
                  <p><span className="font-medium text-slate-900">Subject:</span> {item.subject || '-'}</p>
                  <p>
                    <span className="font-medium text-slate-900">Date:</span>{' '}
                    {item.submissionDate ? new Date(item.submissionDate).toLocaleDateString() : '-'}
                  </p>
                  <p><span className="font-medium text-slate-900">Status:</span> <span className="capitalize">{item.status || '-'}</span></p>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Description:</span> {item.description || '-'}
                </p>

                {item.hasFeedback ? (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Feedback already submitted (Marks: {item.feedback?.marks}, Grade: {item.feedback?.grade}).
                  </div>
                ) : (
                  <div className={`mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 ${isUnchecked ? 'opacity-60' : ''}`}>
                    {isUnchecked && (
                      <div className="md:col-span-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Please mark this submission as checked in Review section before giving feedback.
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Marks</label>
                      <input
                        type="number"
                        min="0"
                        value={form.marks}
                        onChange={(e) => onFormChange(item.submissionId, 'marks', e.target.value)}
                        disabled={isUnchecked}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Grade</label>
                      <input
                        type="text"
                        value={form.grade}
                        onChange={(e) => onFormChange(item.submissionId, 'grade', e.target.value)}
                        disabled={isUnchecked}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Feedback Text</label>
                      <textarea
                        rows={3}
                        value={form.feedbackText}
                        onChange={(e) => onFormChange(item.submissionId, 'feedbackText', e.target.value)}
                        disabled={isUnchecked}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <button
                        type="button"
                        onClick={() => onSubmitFeedback(item.submissionId)}
                        disabled={savingId === item.submissionId || isUnchecked}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
                      >
                        {savingId === item.submissionId ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default TeacherFeedbackPage;