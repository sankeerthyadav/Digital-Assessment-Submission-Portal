import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const roles = ['teacher', 'student'];

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(form.email);
    return form.name.trim().length >= 2 && emailOk && form.password.length >= 6 && roles.includes(form.role);
  }, [form]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) {
      setError('Please fill all fields correctly.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      const { token, user } = res.data.data || {};
      if (token && user) {
        login(token, user);
        navigate(user.role === 'teacher' ? '/teacher' : '/student', { replace: true });
        return;
      }

      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section
          className="relative hidden overflow-hidden lg:flex lg:items-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          <div className="relative z-10 mx-auto max-w-xl px-12 text-white">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight [text-shadow:0_8px_30px_rgba(0,0,0,0.65)]">
              Digital Assessment Submission Portal
            </h1>
            <p className="mt-5 text-lg text-slate-100 [text-shadow:0_4px_16px_rgba(0,0,0,0.6)]">
              Manage and submit assessments efficiently
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <form onSubmit={onSubmit} className="w-full max-w-md animate-[fadeIn_.35s_ease-out] rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] sm:p-9">
            <h1 className="mb-6 text-2xl font-semibold">Create your account</h1>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                minLength={2}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Role</label>
              <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role }))}
                    className={`rounded-full px-3 py-2 text-sm font-medium capitalize transition-all duration-200 ${
                      form.role === role
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition duration-200 hover:scale-[1.01] hover:bg-slate-800 hover:shadow-lg disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>

            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account? <Link className="font-medium text-slate-900" to="/login">Login</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;