import { Navigate, useRoutes } from 'react-router-dom';
import { AdminLayout } from './views/AdminLayout';
import { ContentPage } from './views/ContentPage';
import { DashboardPage } from './views/DashboardPage';
import { MenusPage } from './views/MenusPage';
import { RolesPage } from './views/RolesPage';
import { SettingsPage } from './views/SettingsPage';
import { TableListPage } from './views/TableListPage';
import { UsersPage } from './views/UsersPage';

export function AppRouter() {
  return useRoutes([
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'users', element: <UsersPage /> },
        { path: 'roles', element: <RolesPage /> },
        { path: 'menus', element: <MenusPage /> },
        { path: 'table-list', element: <TableListPage /> },
        { path: 'content', element: <ContentPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ]);
}
