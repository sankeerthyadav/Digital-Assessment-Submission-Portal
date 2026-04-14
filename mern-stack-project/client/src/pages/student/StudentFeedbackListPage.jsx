import { useEffect, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';

function StudentFeedbackListPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState([]);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true);
        const res = await api.get('/student/feedback');
        setFeedbackItems(res?.data?.data || []);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load feedback', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [showToast]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Feedback</h1>
        <p className="text-sm text-slate-500">View marks, grades, and feedback for your submissions.</p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading feedback...
        </div>
      ) : feedbackItems.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No feedback available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {feedbackItems.map((item) => (
            <article key={item.submissionId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
              <p className="text-sm text-slate-500">Assessment</p>
              <h2 className="text-lg font-semibold text-slate-900">{item.assessment?.title || '-'}</h2>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-900">Subject:</span> {item.subject?.name || '-'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Submission Date:</span>{' '}
                  {item.submissionDate ? new Date(item.submissionDate).toLocaleDateString() : '-'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Marks:</span> {item.marks ?? '-'}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Grade:</span> {item.grade || '-'}
                </p>
              </div>

              <div className="mt-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Feedback</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-600">{item.feedbackText || '-'}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default StudentFeedbackListPage;