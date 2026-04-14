import { useEffect, useMemo, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusClass =
    status === 'reviewed'
      ? 'bg-green-100 text-green-700'
      : status === 'issue'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

  return <span className={`px-3 py-1 text-xs rounded-full capitalize ${statusClass}`}>{status}</span>;
}

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [assessmentsRes, submissionsRes] = await Promise.all([
          api.get('/student/assessments'),
          api.get('/student/submissions'),
        ]);

        setAssessments(assessmentsRes?.data?.data || []);
        setSubmissions(submissionsRes?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load student dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metrics = useMemo(() => {
    return submissions.reduce(
      (acc, current) => {
        acc.submitted += 1;
        if (current.status === 'reviewed') acc.reviewed += 1;
        else if (current.status === 'issue') acc.issue += 1;
        else acc.pending += 1;
        return acc;
      },
      { submitted: 0, reviewed: 0, pending: 0, issue: 0 }
    );
  }, [submissions]);

  const recentSubmissions = useMemo(() => submissions.slice(0, 5), [submissions]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of available assessments and your submission statuses.</p>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Assessments" value={loading ? '...' : assessments.length} />
        <StatCard label="Submitted" value={loading ? '...' : metrics.submitted} />
        <StatCard label="Reviewed" value={loading ? '...' : metrics.reviewed} />
        <StatCard label="Pending" value={loading ? '...' : metrics.pending} />
        <StatCard label="Issue" value={loading ? '...' : metrics.issue} />
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
        <h2 className="text-lg font-semibold text-slate-800">Recent Submissions</h2>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading recent submissions...
          </div>
        ) : recentSubmissions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No submissions yet.</p>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Assessment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((submission) => (
                  <tr key={submission._id} className="border-t hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700">{submission.assessment?.title || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {submission.submissionDate ? new Date(submission.submissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <StatusBadge status={submission.status || 'pending'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default StudentDashboard;