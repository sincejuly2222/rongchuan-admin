import { Suspense, lazy, useEffect } from 'react';
import { Spin } from 'antd';
import { Navigate, Outlet, useLocation, useRoutes } from 'react-router-dom';
import { initializeAuth, isAuthenticated, useAuth } from './auth';
import { AdminLayout } from './views/AdminLayout';

const DashboardPage = lazy(() =>
  import('./views/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const UsersPage = lazy(() =>
  import('./views/UsersPage').then((module) => ({ default: module.UsersPage }))
);
const RolesPage = lazy(() =>
  import('./views/RolesPage').then((module) => ({ default: module.RolesPage }))
);
const PermissionsPage = lazy(() =>
  import('./views/PermissionsPage').then((module) => ({ default: module.PermissionsPage }))
);
const MenusPage = lazy(() =>
  import('./views/MenusPage').then((module) => ({ default: module.MenusPage }))
);
const ProfilePage = lazy(() =>
  import('./views/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const LoginPage = lazy(() =>
  import('./views/LoginPage').then((module) => ({ default: module.LoginPage }))
);

function withSuspense(element: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="route-loading">
          <Spin size="large" />
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

function RequireAuth() {
  const location = useLocation();
  const auth = useAuth();

  useEffect(() => {
    void initializeAuth();
  }, []);

  if (!auth.initialized) {
    return (
      <div className="route-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
}

export function AppRouter() {
  return useRoutes([
    {
      path: '/login',
      element: withSuspense(<LoginPage />),
    },
    {
      element: <RequireAuth />,
      children: [
        {
          path: '/',
          element: <AdminLayout />,
          children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: withSuspense(<DashboardPage />) },
            { path: 'users', element: withSuspense(<UsersPage />) },
            { path: 'roles', element: withSuspense(<RolesPage />) },
            { path: 'permissions', element: withSuspense(<PermissionsPage />) },
            { path: 'menus', element: withSuspense(<MenusPage />) },
            { path: 'profile', element: withSuspense(<ProfilePage />) },
            { path: '*', element: <Navigate to="/dashboard" replace /> },
          ],
        },
      ],
    }
  ]);
}
