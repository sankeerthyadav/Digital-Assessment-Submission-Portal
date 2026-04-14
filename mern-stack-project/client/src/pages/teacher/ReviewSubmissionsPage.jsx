import { useEffect, useMemo, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/ToastProvider';

const statuses = ['pending', 'reviewed', 'issue'];

function StatusBadge({ status }) {
  const statusClass =
    status === 'reviewed'
      ? 'bg-green-100 text-green-700'
      : status === 'issue'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

  return <span className={`px-3 py-1 text-xs rounded-full capitalize ${statusClass}`}>{status}</span>;
}

function ReviewSubmissionsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [checkingId, setCheckingId] = useState('');
  const [exportingType, setExportingType] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    subject: '',
    status: '',
    studentName: '',
    date: '',
  });
  const [editState, setEditState] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.subject) params.subject = filters.subject;
        if (filters.status) params.status = filters.status;
        if (filters.studentName.trim()) params.studentName = filters.studentName.trim();
        if (filters.date) params.date = filters.date;

        const res = await api.get('/teacher/submissions', { params });
        const list = res?.data?.data || [];
        setSubmissions(list);

        const initialEdit = list.reduce((acc, item) => {
          acc[item._id] = {
            status: item.status || 'pending',
            rejectionReason: item.rejectionReason || '',
          };
          return acc;
        }, {});
        setEditState(initialEdit);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load submissions', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [filters, showToast]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get('/teacher/subjects');
        setSubjects(res?.data?.data || []);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load subjects', 'error');
      }
    };

    loadSubjects();
  }, [showToast]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(Math.ceil(submissions.length / pageSize), 1);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return submissions.slice(start, start + pageSize);
  }, [page, submissions]);

  const onStatusChange = (id, status) => {
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        rejectionReason: status === 'issue' ? prev[id]?.rejectionReason || '' : '',
      },
    }));
  };

  const onReasonChange = (id, value) => {
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        rejectionReason: value,
      },
    }));
  };

  const onSaveStatus = async (id) => {
    const row = editState[id];
    if (!row) return;

    if (row.status === 'issue' && !row.rejectionReason.trim()) {
      showToast('Rejection reason is required when status is issue', 'error');
      return;
    }

    try {
      setSavingId(id);
      const payload = {
        status: row.status,
        rejectionReason: row.status === 'issue' ? row.rejectionReason.trim() : '',
      };

      const res = await api.put(`/teacher/submissions/${id}/status`, payload);
      showToast(res?.data?.message || 'Submission status updated successfully');

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: row.status,
                rejectionReason: row.status === 'issue' ? row.rejectionReason.trim() : null,
              }
            : item
        )
      );
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update submission status', 'error');
    } finally {
      setSavingId('');
    }
  };

  const onMarkChecked = async (id) => {
    try {
      setCheckingId(id);
      const res = await api.patch(`/submissions/${id}/check`);
      showToast(res?.data?.message || 'Submission marked as checked successfully');

      setSubmissions((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isChecked: true,
              }
            : item
        )
      );
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to mark submission as checked', 'error');
    } finally {
      setCheckingId('');
    }
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const onClearFilters = () => {
    setFilters({ subject: '', status: '', studentName: '', date: '' });
  };

  const triggerDownload = (blob, filename) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const onExportCsv = async () => {
    try {
      setExportingType('csv');
      const res = await api.get('/submissions/export/csv', { responseType: 'blob' });
      triggerDownload(res.data, 'submissions.csv');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to export CSV', 'error');
    } finally {
      setExportingType('');
    }
  };

  const onDownloadZip = async () => {
    try {
      setExportingType('zip');
      const res = await api.get('/submissions/export/zip', { responseType: 'blob' });
      triggerDownload(res.data, 'submissions.zip');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to download ZIP', 'error');
    } finally {
      setExportingType('');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Review Submissions</h1>
        <p className="text-sm text-slate-500">Review student submissions and update their status.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-200 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
          <select
            value={filters.subject}
            onChange={(e) => onFilterChange('subject', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Student Name</label>
          <input
            type="text"
            value={filters.studentName}
            onChange={(e) => onFilterChange('studentName', e.target.value)}
            placeholder="Search student"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onFilterChange('date', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExportCsv}
          disabled={exportingType !== ''}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
        >
          {exportingType === 'csv' ? 'Exporting CSV...' : 'Export CSV'}
        </button>
        <button
          type="button"
          onClick={onDownloadZip}
          disabled={exportingType !== ''}
          className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 disabled:opacity-60"
        >
          {exportingType === 'zip' ? 'Downloading ZIP...' : 'Download ZIP'}
        </button>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No submissions available for review.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student Name</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assessment Title</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Submission Date</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">File</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Current Status</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Check Status</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Update</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((submission) => {
                const row = editState[submission._id] || {
                  status: submission.status || 'pending',
                  rejectionReason: submission.rejectionReason || '',
                };

                return (
                  <tr key={submission._id} className="border-t hover:bg-slate-50 transition align-top">
                    <td className="px-4 py-3 text-slate-700">{submission.studentName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{submission.title || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{submission.subject || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{submission.description || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {submission.fileUrl ? (
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200"
                        >
                          Download
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <StatusBadge status={submission.status || 'pending'} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {submission.isChecked ? (
                        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          ✔ Checked
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onMarkChecked(submission._id)}
                          disabled={checkingId === submission._id}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-60"
                        >
                          {checkingId === submission._id ? 'Checking...' : 'Mark as Checked'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="space-y-2">
                        <select
                          value={row.status}
                          onChange={(e) => onStatusChange(submission._id, e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {row.status === 'issue' && (
                          <input
                            type="text"
                            value={row.rejectionReason}
                            onChange={(e) => onReasonChange(submission._id, e.target.value)}
                            placeholder="Enter rejection reason"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => onSaveStatus(submission._id)}
                          disabled={savingId === submission._id}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
                        >
                          {savingId === submission._id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default ReviewSubmissionsPage;