import { useEffect, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';

function ViewAssessmentsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [downloadingId, setDownloadingId] = useState('');

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        setLoading(true);
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

  const onDownload = async (assessment) => {
    if (!assessment?._id) return;

    try {
      setDownloadingId(assessment._id);
      const response = await api.get(`/student/assessments/${assessment._id}/download`, {
        responseType: 'blob',
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${assessment.title || 'assessment-file'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to download file', 'error');
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">View Assessments</h1>
        <p className="text-sm text-slate-500">Browse all available assessments and download files.</p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading assessments...
        </div>
      ) : assessments.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No assessments available at the moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {assessments.map((assessment) => (
            <article key={assessment._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
              <p className="text-sm text-slate-500">Title</p>
              <h2 className="text-lg font-semibold text-slate-900">{assessment.title || 'Untitled Assessment'}</h2>

              <div className="mt-3" />
              <p className="text-sm text-slate-500">Subject</p>
              <h3 className="text-base font-semibold text-slate-900">{assessment.subject?.name || '-'}</h3>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-900">Deadline:</span>{' '}
                  {assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : '-'}
                </p>
              </div>

              <div className="mt-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Instructions</p>
                <p className="mt-1 text-slate-600">{assessment.description || '-'}</p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onDownload(assessment)}
                  disabled={downloadingId === assessment._id}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
                >
                  {downloadingId === assessment._id ? 'Downloading...' : 'Download File'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ViewAssessmentsPage;