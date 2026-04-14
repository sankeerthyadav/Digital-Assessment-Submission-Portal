import { useEffect, useMemo, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/ToastProvider';

function TeacherTrackingPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    const loadAssessments = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 10,
        };

        if (subjectFilter !== 'all') {
          params.subject = subjectFilter;
        }

        const res = await api.get('/teacher/assessments', { params });
        const data = res?.data?.data || {};
        setAssessments(data.assessments || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load assessments', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [page, subjectFilter, showToast]);

  const loadAssessments = async (nextPage = page, nextSubjectFilter = subjectFilter) => {
    setLoading(true);
    try {
      const params = {
        page: nextPage,
        limit: 10,
      };

      if (nextSubjectFilter !== 'all') {
        params.subject = nextSubjectFilter;
      }

      const res = await api.get('/teacher/assessments', { params });
      const data = res?.data?.data || {};
      setAssessments(data.assessments || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to load assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      setDeletingAssessmentId(id);
      const res = await api.delete(`/teacher/assessments/${id}`);
      showToast(res?.data?.message || 'Assessment deleted successfully');

      const nextPage = assessments.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) setPage(nextPage);
      await loadAssessments(nextPage, subjectFilter);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete assessment', 'error');
    } finally {
      setDeletingAssessmentId('');
    }
  };

  const subjectMap = useMemo(() => {
    return subjects.reduce((acc, subject) => {
      acc[subject._id] = subject.name;
      return acc;
    }, {});
  }, [subjects]);

  const onFilterChange = (value) => {
    setSubjectFilter(value);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teacher Tracking</h1>
          <p className="text-sm text-slate-500">Track all created assessments by subject and timeline.</p>
        </div>

        <div className="w-full sm:w-64">
          <label className="text-sm font-medium text-slate-700 mb-1 block">Filter by Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading assessments...
        </div>
      ) : assessments.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No assessments found for the selected filter.
        </p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Created Date</th>
                <th className="px-4 py-3 text-left">Deadline</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment._id} className="border-t hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-700">
                    {subjectMap[assessment.subject] || assessment.subject?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{assessment.title || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <button
                      type="button"
                      onClick={() => onDeleteAssessment(assessment._id)}
                      disabled={deletingAssessmentId === assessment._id}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-60"
                    >
                      {deletingAssessmentId === assessment._id ? 'Deleting...' : 'Delete'}
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

export default TeacherTrackingPage;