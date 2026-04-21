import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  ApartmentOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileExcelOutlined,
  LogoutOutlined,
  MenuOutlined,
  ProfileOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SafetyOutlined,
  TeamOutlined,
  TranslationOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer, ProLayout, type MenuDataItem } from '@ant-design/pro-components';
import { App, Avatar, Button, Space, Tag, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { fetchMenuTree, type MenuTreeItem } from '../../api/menus';
import { getCurrentUser, logout, useAuth } from '../../auth';
import './index.less';

const iconMap: Record<string, ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  MenuOutlined: <MenuOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  TeamOutlined: <TeamOutlined />,
  ReadOutlined: <ReadOutlined />,
  FileExcelOutlined: <FileExcelOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
};

const businessMenuGroup: MenuDataItem = {
  path: '/alumni-services',
  name: '校友业务',
  icon: <TeamOutlined />,
  children: [
    {
      path: '/alumni',
      name: '校友管理',
      icon: <TeamOutlined />,
    },
    {
      path: '/student-status',
      name: '学籍管理',
      icon: <ReadOutlined />,
    },
    {
      path: '/excel-import',
      name: 'Excel 批量导入',
      icon: <FileExcelOutlined />,
    },
    {
      path: '/activities',
      name: '活动管理',
      icon: <CalendarOutlined />,
    },
    {
      path: '/organizations',
      name: '组织管理',
      icon: <ApartmentOutlined />,
    },
  ],
};

const fallbackMenuData: MenuDataItem[] = [
  {
    path: '/dashboard',
    name: '首页',
    icon: <DashboardOutlined />,
  },
  {
    path: '/users',
    name: '用户管理',
    icon: <UserOutlined />,
  },
  {
    path: '/roles',
    name: '角色管理',
    icon: <SafetyOutlined />,
  },
  {
    path: '/menus',
    name: '菜单管理',
    icon: <MenuOutlined />,
  },
  businessMenuGroup,
  {
    path: '/profile',
    name: '个人中心',
    icon: <ProfileOutlined />,
  },
];

function resolveMenuIcon(iconName: string | null) {
  if (!iconName) {
    return <MenuOutlined />;
  }

  return iconMap[iconName] ?? <MenuOutlined />;
}

function buildMenuData(items: MenuTreeItem[]): MenuDataItem[] {
  return items
    .filter((item) => item.status === 1)
    .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
    .map((item) => {
      const children = buildMenuData(item.children);

      return {
        path: item.path || undefined,
        name: item.menu_name,
        icon: resolveMenuIcon(item.icon),
        children: children.length > 0 ? children : undefined,
      } satisfies MenuDataItem;
    })
    .filter((item) => item.path || item.children?.length);
}

function collectMenuPaths(items: MenuDataItem[]): Set<string> {
  const paths = new Set<string>();

  items.forEach((item) => {
    if (item.path) {
      paths.add(item.path);
    }

    if (item.children?.length) {
      collectMenuPaths(item.children).forEach((path) => paths.add(path));
    }
  });

  return paths;
}

function mergeBusinessMenus(menuData: MenuDataItem[]) {
  const existingPaths = collectMenuPaths(menuData);
  const missingChildren =
    businessMenuGroup.children?.filter((child) => !child.path || !existingPaths.has(child.path)) ?? [];

  if (missingChildren.length === 0) {
    return menuData;
  }

  return [
    ...menuData,
    {
      ...businessMenuGroup,
      children: missingChildren,
    },
  ];
}

export function AdminLayout() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [menuData, setMenuData] = useState<MenuDataItem[]>(mergeBusinessMenus(fallbackMenuData));
  const [menuLoaded, setMenuLoaded] = useState(false);

  const currentUser = auth.user ?? getCurrentUser();
  const currentAvatar =
    currentUser?.avatar ??
    'https://gw.alipayobjects.com/zos/antfincdn/CRHobKQmQx/avatar%26mail.png';
  const currentName = currentUser?.name || currentUser?.username || '未登录';
  const currentRoles = currentUser?.roleNames?.filter(Boolean) ?? [];

  useEffect(() => {
    let active = true;

    const loadMenus = async () => {
      try {
        const tree = await fetchMenuTree();

        if (!active) {
          return;
        }

        const nextMenuData = buildMenuData(tree);
        setMenuData(nextMenuData);
        setMenuLoaded(true);
      } catch (error) {
        if (!active) {
          return;
        }

        setMenuData(mergeBusinessMenus(fallbackMenuData));
        setMenuLoaded(true);
        message.error(error instanceof Error ? error.message : '获取导航菜单失败');
      }
    };

    void loadMenus();

    return () => {
      active = false;
    };
  }, [message]);

  useEffect(() => {
    if (!menuLoaded || menuData.length === 0) {
      return;
    }

    const accessiblePaths = collectMenuPaths(menuData);
    const currentPath = location.pathname;
    const hasAccess =
      accessiblePaths.has(currentPath) ||
      (currentPath.startsWith('/dashboard/apis/') && accessiblePaths.has('/dashboard'));

    if (!hasAccess) {
      navigate(accessiblePaths.values().next().value || '/dashboard', { replace: true });
    }
  }, [location.pathname, menuData, menuLoaded, navigate]);

  const handleLogout = async () => {
    await logout();
    message.success('已退出登录');
    navigate('/login', { replace: true });
  };

  const renderTopHeader = () => (
    <header className="pro-like-header">
      <div className="pro-like-header__left">
        <img
          className="pro-like-header__logo"
          src="https://gw.alipayobjects.com/zos/antfincdn/KPR%24Yt%26m7/logo.svg"
          alt="Rongchuan Admin"
        />
        <span className="pro-like-header__title">Rongchuan Admin</span>
      </div>

      <div className="pro-like-header__right">
        <QuestionCircleOutlined className="pro-like-header__icon" />
        <TranslationOutlined className="pro-like-header__icon" />
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className="pro-like-header__logout"
          onClick={handleLogout}
        >
          退出
        </Button>
        <div className="pro-like-header__profile">
          <Avatar size={36} src={currentAvatar} />
          <div>
            <span className="pro-like-header__name">{currentName}</span>
            {currentRoles.length > 0 ? (
              <div>
                <Tag color="blue" style={{ marginInlineStart: 8, borderRadius: 999 }}>
                  {currentRoles.join(' / ')}
                </Tag>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <ProLayout
      title="Rongchuan Admin"
      logo="https://gw.alipayobjects.com/zos/antfincdn/KPR%24Yt%26m7/logo.svg"
      location={{ pathname: location.pathname }}
      layout="mix"
      fixedHeader
      fixSiderbar
      menuHeaderRender={false}
      headerRender={renderTopHeader}
      route={{ routes: menuData }}
      siderWidth={232}
      menuItemRender={(item, dom) =>
        item.path && !item.disabled ? <Link to={item.path}>{dom}</Link> : dom
      }
      avatarProps={{
        src: currentAvatar,
        title: currentName,
        size: 'small',
        render: (_, avatarChildren) => (
          <Space size={8}>
            <Avatar size="small" src={currentAvatar} />
            <Space size={6}>
              <Typography.Text style={{ color: '#8c8c8c', fontWeight: 400 }}>
                {avatarChildren}
              </Typography.Text>
              {currentRoles.length > 0 ? (
                <Tag color="blue" style={{ marginInlineEnd: 0, borderRadius: 999 }}>
                  {currentRoles[0]}
                </Tag>
              ) : null}
            </Space>
          </Space>
        ),
      }}
      actionsRender={() => [
        <QuestionCircleOutlined
          key="help"
          style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: 18 }}
        />,
        <TranslationOutlined
          key="translate"
          style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: 18 }}
        />,
      ]}
      token={{
        bgLayout: '#f5f7fb',
        sider: {
          colorMenuBackground: '#ffffff',
          colorTextMenu: 'rgba(0, 0, 0, 0.65)',
          colorTextMenuSelected: '#1677ff',
          colorBgMenuItemSelected: 'rgba(22, 119, 255, 0.08)',
          colorTextMenuActive: '#1677ff',
          colorTextMenuItemHover: '#1677ff',
        },
        header: {
          colorBgHeader: '#ffffff',
          colorHeaderTitle: '#1f1f1f',
          colorBgRightActionsItemHover: 'rgba(0, 0, 0, 0.04)',
          colorTextRightActionsItem: '#1f1f1f',
          heightLayoutHeader: 56,
        },
        pageContainer: {
          paddingBlockPageContainerContent: 0,
          paddingInlinePageContainerContent: 0,
        },
      }}
    >
      <PageContainer content={false} style={{ padding: 0 }}>
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
}
