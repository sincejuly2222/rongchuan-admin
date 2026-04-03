import {
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  TranslationOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProLayout,
  type MenuDataItem,
} from '@ant-design/pro-components';
import { App, Avatar, Button, Space, Tag, Typography } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, useAuth } from '../auth';

const menuData: MenuDataItem[] = [
  {
    path: '/dashboard',
    name: '首页',
    icon: <DashboardOutlined />
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
    path: '/permissions',
    name: '权限管理',
    icon: <SafetyCertificateOutlined />,
  },
  {
    path: '/menus',
    name: '菜单管理',
    icon: <MenuOutlined />,
  },
  {
    path: '/profile',
    name: '个人中心',
    icon: <ProfileOutlined />,
  },
];

export function AdminLayout() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const currentUser = auth.user ?? getCurrentUser();
  const currentAvatar =
    currentUser?.avatar ??
    'https://gw.alipayobjects.com/zos/antfincdn/CRHobKQmQx/avatar%26mail.png';
  const currentName = currentUser?.name || currentUser?.username || '未登录';
  const currentRoles = currentUser?.roleNames?.filter(Boolean) ?? [];

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
          alt="Ant Design Pro"
        />
        <span className="pro-like-header__title">Ant Design Pro</span>
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
      <PageContainer
        content={false}
        style={{ padding: 0 }}
      >
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
}
