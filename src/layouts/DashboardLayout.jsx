import { Suspense, useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageLoader, useConfirm } from '@/components';
import { useAuth } from '@/features/auth/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Sidebar } from './Sidebar';
import { AdminSearch, AgentSearch } from './TopbarSearch';
import { UserMenu } from './UserMenu';

/** Shared shell for all four dashboards; the role sets the navigation and accent colour. */
export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirm();
  const [navOpen, setNavOpen] = useState(false);
  const [navPath, setNavPath] = useState(location.pathname);
  // Close the mobile drawer after navigation.
  if (navPath !== location.pathname) {
    setNavPath(location.pathname);
    setNavOpen(false);
  }

  // Portalled UI (modals, toasts) lives outside .app, so the role accent is also set on <html>.
  useEffect(() => {
    document.documentElement.dataset.role = user.role;
    return () => {
      delete document.documentElement.dataset.role;
    };
  }, [user.role]);

  const handleLogout = async () => {
    if (await confirm({ title: 'Log out?', message: 'You will need to sign in again to access the portal.', confirmLabel: 'Log out' })) {
      await logout();
      navigate(`/login/${user.role}`, { replace: true });
    }
  };

  return (
    <div className={`app ${navOpen ? 'app--nav-open' : ''}`} data-role={user.role}>
      <Sidebar user={user} onNavigate={() => setNavOpen(false)} onLogout={handleLogout} />
      <div className="sidebar-overlay" onClick={() => setNavOpen(false)} aria-hidden="true" />
      <div className="app__main">
        <header className="topbar">
          <button type="button" className="icon-btn topbar__menu" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          {user.role === 'admin' && <AdminSearch />}
          {user.role === 'agent' && <AgentSearch />}
          <div className="spacer" />
          <NotificationBell />
          <span className="topbar__divider" aria-hidden="true" />
          <UserMenu user={user} onLogout={handleLogout} />
        </header>
        <main className="app__content" id="main">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
