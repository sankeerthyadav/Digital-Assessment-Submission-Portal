import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';

function FeedbackPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const res = await api.get(`/student/submissions/${id}/feedback`);
        setFeedback(res?.data?.data || null);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load feedback', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, [id, showToast]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Feedback</h1>
        <p className="text-sm text-slate-500">Detailed review for your submission.</p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading feedback...
        </div>
      ) : !feedback ? (
        <p className="mt-6 rounded-lg bg-white p-4 text-slate-600 shadow-sm">No feedback available.</p>
      ) : (
        <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Marks</p>
              <p className="text-xl font-semibold">{feedback.marks}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Grade</p>
              <p className="text-xl font-semibold">{feedback.grade}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500">Feedback</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-800">{feedback.feedbackText}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default FeedbackPage;