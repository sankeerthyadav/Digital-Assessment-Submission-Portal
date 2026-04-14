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

function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [assessmentsRes, subjectsRes, submissionsRes] = await Promise.all([
          api.get('/teacher/assessments', { params: { limit: 1000 } }),
          api.get('/teacher/subjects'),
          api.get('/teacher/submissions'),
        ]);

        setAssessments(assessmentsRes?.data?.data?.assessments || []);
        setSubjects(subjectsRes?.data?.data || []);
        setSubmissions(submissionsRes?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load teacher dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statusCounts = useMemo(() => {
    return submissions.reduce(
      (acc, current) => {
        if (current.status === 'reviewed') acc.reviewed += 1;
        else if (current.status === 'issue') acc.issue += 1;
        else acc.pending += 1;
        return acc;
      },
      { reviewed: 0, pending: 0, issue: 0 }
    );
  }, [submissions]);

  const recentAssessments = useMemo(() => assessments.slice(0, 5), [assessments]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of assessments, subjects, and review statuses.</p>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Assessments" value={loading ? '...' : assessments.length} />
        <StatCard label="Subjects Count" value={loading ? '...' : subjects.length} />
        <StatCard label="Reviewed" value={loading ? '...' : statusCounts.reviewed} />
        <StatCard label="Pending" value={loading ? '...' : statusCounts.pending} />
        <StatCard label="Issue" value={loading ? '...' : statusCounts.issue} />
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
        <h2 className="text-lg font-semibold text-slate-800">Recent Assessments</h2>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading recent assessments...
          </div>
        ) : recentAssessments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No assessments created yet.</p>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Created Date</th>
                  <th className="px-4 py-3 text-left">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.map((assessment) => (
                  <tr key={assessment._id} className="border-t hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-700">{assessment.title || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{assessment.subject?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : '-'}
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

export default TeacherDashboard;