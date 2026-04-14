import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`${isCollapsed ? 'ml-20' : 'ml-64'}  transition-all duration-300 p-4 sm:p-6`}>
        <Header />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;