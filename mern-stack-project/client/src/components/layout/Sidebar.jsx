import { memo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinkClass = (isCollapsed) => ({ isActive }) =>
  `group relative flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm transition-all duration-200 ${
    isActive
      ? 'border-indigo-400 bg-white/20 font-semibold text-white shadow-[0_8px_24px_-12px_rgba(99,102,241,0.9)]'
      : 'border-transparent text-slate-200/90 hover:scale-[1.01] hover:bg-white/10 hover:text-white'
  }`;

function DotIcon({ children }) {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 text-sm transition-colors duration-200 group-hover:bg-white/25">
      {children}
    </span>
  );
}

function SidebarLink({ to, label, icon, isCollapsed, end = false }) {
  return (
    <NavLink to={to} end={end} className={navLinkClass(isCollapsed)} title={isCollapsed ? label : undefined}>
      <DotIcon>{icon}</DotIcon>
      {!isCollapsed && <span>{label}</span>}
      {isCollapsed && (
        <span className="pointer-events-none absolute left-full z-20 ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          {label}
        </span>
      )}
    </NavLink>
  );
}

function TeacherMenu({ isCollapsed }) {
  return (
    <>
      {!isCollapsed && (
        <p className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300/70">Teacher</p>
      )}
      <SidebarLink to="/teacher" end label="Overview" icon="📊" isCollapsed={isCollapsed} />
      <SidebarLink to="/teacher/assessments/create" label="Create Assessment" icon="📝" isCollapsed={isCollapsed} />
      <SidebarLink to="/teacher/tracking" label="Tracking" icon="📋" isCollapsed={isCollapsed} />
      <SidebarLink to="/teacher/review-submissions" label="Review Submissions" icon="✅" isCollapsed={isCollapsed} />
      <SidebarLink to="/teacher/feedback" label="Feedback" icon="💬" isCollapsed={isCollapsed} />
    </>
  );
}

function StudentMenu({ isCollapsed }) {
  return (
    <>
      {!isCollapsed && (
        <p className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300/70">Student</p>
      )}
      <SidebarLink to="/student" end label="Overview" icon="🎯" isCollapsed={isCollapsed} />
      <SidebarLink to="/student/assessments" label="View Assessments" icon="📄" isCollapsed={isCollapsed} />
      <SidebarLink to="/student/submissions/new" label="Submission Form" icon="📤" isCollapsed={isCollapsed} />
      <SidebarLink to="/student/tracking" label="Tracking" icon="📌" isCollapsed={isCollapsed} />
      <SidebarLink to="/student/feedback" label="Feedback" icon="💡" isCollapsed={isCollapsed} />
    </>
  );
}

function SidebarComponent({isCollapsed, setIsCollapsed}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role;
  

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col rounded-r-2xl border-r border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-4 text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        {!isCollapsed ? (
          <div>
            <h2 className="mb-1 text-lg font-bold text-white">Assessment Portal</h2>
            <p className="text-xs capitalize text-slate-300">Signed in as {user?.role || 'user'}</p>
          </div>
        ) : (
          <div className="h-10" />
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-slate-100 transition hover:bg-white/15"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="space-y-2">
        {role === 'teacher' && <TeacherMenu isCollapsed={isCollapsed} />}
        {role === 'student' && <StudentMenu isCollapsed={isCollapsed} />}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className={`mt-auto rounded-xl border border-red-400/30 bg-red-500/20 px-3 py-2.5 text-sm font-semibold text-red-100 transition duration-200 hover:bg-red-500/35 ${
          isCollapsed ? 'w-full' : 'w-full'
        }`}
        title={isCollapsed ? 'Logout' : undefined}
      >
        {isCollapsed ? '⎋' : 'Logout'}
      </button>
    </aside>
  );
}

const Sidebar = memo(SidebarComponent);

export default Sidebar;