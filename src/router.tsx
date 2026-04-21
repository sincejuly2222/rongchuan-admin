import { Suspense, lazy, useEffect } from 'react';
import { Spin } from 'antd';
import { Navigate, Outlet, useLocation, useRoutes } from 'react-router-dom';
import { initializeAuth, isAuthenticated, useAuth } from './auth';
import { AdminLayout } from './views/AdminLayout';

const DashboardPage = lazy(() =>
  import('./views/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const ApiDetailPage = lazy(() =>
  import('./views/ApiDetailPage').then((module) => ({ default: module.ApiDetailPage }))
);
const UsersPage = lazy(() =>
  import('./views/UsersPage').then((module) => ({ default: module.UsersPage }))
);
const RolesPage = lazy(() =>
  import('./views/RolesPage').then((module) => ({ default: module.RolesPage }))
);
const MenusPage = lazy(() =>
  import('./views/MenusPage').then((module) => ({ default: module.MenusPage }))
);
const ProfilePage = lazy(() =>
  import('./views/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const AlumniPage = lazy(() =>
  import('./views/AlumniPage').then((module) => ({ default: module.AlumniPage }))
);
const StudentStatusPage = lazy(() =>
  import('./views/StudentStatusPage').then((module) => ({ default: module.StudentStatusPage }))
);
const ExcelImportPage = lazy(() =>
  import('./views/ExcelImportPage').then((module) => ({ default: module.ExcelImportPage }))
);
const ActivitiesPage = lazy(() =>
  import('./views/ActivitiesPage').then((module) => ({ default: module.ActivitiesPage }))
);
const OrganizationsPage = lazy(() =>
  import('./views/OrganizationsPage').then((module) => ({ default: module.OrganizationsPage }))
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
            { path: 'dashboard/apis/:apiId', element: withSuspense(<ApiDetailPage />) },
            { path: 'users', element: withSuspense(<UsersPage />) },
            { path: 'roles', element: withSuspense(<RolesPage />) },
            { path: 'menus', element: withSuspense(<MenusPage />) },
            { path: 'profile', element: withSuspense(<ProfilePage />) },
            { path: 'alumni', element: withSuspense(<AlumniPage />) },
            { path: 'student-status', element: withSuspense(<StudentStatusPage />) },
            { path: 'excel-import', element: withSuspense(<ExcelImportPage />) },
            { path: 'activities', element: withSuspense(<ActivitiesPage />) },
            { path: 'organizations', element: withSuspense(<OrganizationsPage />) },
            { path: '*', element: <Navigate to="/dashboard" replace /> },
          ],
        },
      ],
    },
  ]);
}
