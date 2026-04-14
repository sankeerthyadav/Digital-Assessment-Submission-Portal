import { useEffect, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/ToastProvider';

function AssessmentCreatePage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [form, setForm] = useState({
    subject: '',
    title: '',
    description: '',
    deadline: '',
    file: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await api.get('/teacher/subjects');
        const list = res?.data?.data || [];
        setSubjects(list);
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load subjects', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, [showToast]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file }));
  };

  const onAddSubject = async () => {
    const trimmed = subjectName.trim();
    if (!trimmed) {
      showToast('Subject name is required', 'error');
      return;
    }

    try {
      setAddingSubject(true);
      const res = await api.post('/teacher/subjects', { name: trimmed });
      const created = res?.data?.data;

      if (created?._id) {
        setSubjects((prev) => [created, ...prev]);
        setForm((prev) => ({ ...prev, subject: created._id }));
      }

      setSubjectName('');
      showToast(res?.data?.message || 'Subject created successfully');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create subject', 'error');
    } finally {
      setAddingSubject(false);
    }
  };

  const onDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      setDeletingSubjectId(id);
      const res = await api.delete(`/teacher/subjects/${id}`);

      setSubjects((prev) => prev.filter((subject) => subject._id !== id));
      setForm((prev) => ({
        ...prev,
        subject: prev.subject === id ? '' : prev.subject,
      }));

      showToast(res?.data?.message || 'Subject deleted successfully');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete subject', 'error');
    } finally {
      setDeletingSubjectId('');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.subject) nextErrors.subject = 'Subject is required';
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.deadline) nextErrors.deadline = 'Deadline is required';
    if (!form.file) nextErrors.file = 'Assessment file is required';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast('Please fill all fields and attach a file', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('subject', form.subject);
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('deadline', form.deadline);
    payload.append('file', form.file);

    try {
      setSaving(true);
      const res = await api.post('/teacher/assessments', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(res?.data?.message || 'Assessment created successfully');
      setForm({ subject: '', title: '', description: '', deadline: '', file: null });
      setErrors({});
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create assessment', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Create Assessment</h1>
        <p className="text-sm text-slate-500">Create and publish a new assessment for students.</p>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-slate-600">
          <Spinner /> Loading subjects...
        </div>
      ) : (
        <div className="grid max-w-3xl grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
            <h2 className="text-lg font-semibold">Select or Create Subject</h2>
            <p className="mt-1 text-sm text-slate-600">Choose an existing subject or add a new one.</p>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Select Subject</label>
              <select
                name="subject"
                value={form.subject}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Create New Subject</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onAddSubject}
                  disabled={addingSubject}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
                >
                  {addingSubject ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Created Subjects</p>
              {subjects.length === 0 ? (
                <p className="text-sm text-slate-600">No subjects created yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {subjects.map((subject) => (
                    <li key={subject._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-700">
                      <span>{subject.name}</span>
                      <button
                        type="button"
                        onClick={() => onDeleteSubject(subject._id)}
                        disabled={deletingSubjectId === subject._id}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-60"
                      >
                        {deletingSubjectId === subject._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 hover:shadow-md transition">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                required
              />
              {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Assessment File</label>
              <input type="file" onChange={onFileChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none" required />
              {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="border-white/40 border-t-white" /> Creating...
                </>
              ) : (
                'Create Assessment'
              )}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

export default AssessmentCreatePage;