import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';
import Pagination from '../../components/ui/Pagination';

function StatusBadge({ status }) {
  const statusClass =
    status === 'reviewed'
      ? 'bg-green-100 text-green-700'
      : status === 'issue'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

  return <span className={`px-3 py-1 text-xs rounded-full capitalize ${statusClass}`}>{status}</span>;
}

function TrackingPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const res = await api.get('/student/submissions');
        setSubmissions(res?.data?.data || []);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load submissions', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSubmissions();
  }, [showToast]);

  const onDeleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    try {
      setDeletingSubmissionId(id);
      const res = await api.delete(`/student/submissions/${id}`);
      setSubmissions((prev) => prev.filter((submission) => submission._id !== id));
      showToast(res?.data?.message || 'Submission deleted successfully');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete submission', 'error');
    } finally {
      setDeletingSubmissionId('');
    }
  };

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return submissions.filter((submission) => {
      const subject = (submission.subject?.name || '').toLowerCase();
      const assessment = (submission.assessment?.title || '').toLowerCase();
      const matchesSearch = !query || subject.includes(query) || assessment.includes(query);
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchTerm, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredSubmissions.length / pageSize), 1);

  const paginatedSubmissions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, page]);

  const hasItems = useMemo(() => filteredSubmissions.length > 0, [filteredSubmissions]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Submission Tracking</h1>
        <p className="text-sm text-slate-500">Track statuses and review results for your submissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-200 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Search by subject / assessment</label>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. Mathematics"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Filter by status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="issue">Issue</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading submissions...
        </div>
      ) : !hasItems ? (
        <p className="mt-6 rounded-lg bg-white p-4 text-slate-600 shadow-sm">No submissions found yet.</p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Assessment</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Feedback</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((submission) => (
                <tr key={submission._id} className="border-t hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-700">{submission.assessment?.title || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{submission.subject?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-700"><StatusBadge status={submission.status || 'pending'} /></td>
                  <td className="px-4 py-3 text-slate-700">{submission.rejectionReason || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <Link to={`/student/feedback/${submission._id}`} className="font-medium text-slate-900 underline">
                      View
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <button
                      type="button"
                      onClick={() => onDeleteSubmission(submission._id)}
                      disabled={deletingSubmissionId === submission._id}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-60"
                    >
                      {deletingSubmissionId === submission._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default TrackingPage;