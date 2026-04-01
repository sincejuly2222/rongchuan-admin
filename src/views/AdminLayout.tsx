import {
  CheckCircleOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  OrderedListOutlined,
  ProfileOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TranslationOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProLayout,
  type MenuDataItem,
} from '@ant-design/pro-components';
import { Avatar, Space, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

const menuData: MenuDataItem[] = [
  {
    path: '/dashboard',
    name: '首页',
    icon: <DashboardOutlined />
  },
  {
    path: '/forms',
    name: '表单页',
    icon: <FormOutlined />,
    children: [
      {
        path: '/content',
        name: '基础表单',
      },
      {
        path: '/menus',
        name: '分步表单',
      },
      {
        path: '/settings',
        name: '高级表单',
        disabled: true,
      },
    ],
  },
  {
    path: '/lists',
    name: '列表页',
    icon: <OrderedListOutlined />,
    children: [
      {
        path: '/table-list',
        name: '查询表格',
      },
      {
        path: '/users',
        name: '标准列表',
      },
      {
        path: '/content',
        name: '卡片列表',
      },
    ],
  },
  {
    path: '/details',
    name: '详情页',
    icon: <ProfileOutlined />,
    children: [
      {
        path: '/menus',
        name: '基础详情页',
      },
      {
        path: '/roles',
        name: '高级详情页',
      },
    ],
  },
  {
    path: '/result',
    name: '结果页',
    icon: <CheckCircleOutlined />,
    children: [
      {
        path: '/settings',
        name: '成功页',
        disabled: true,
      },
      {
        path: '/settings-error',
        name: '失败页',
        disabled: true,
      },
    ],
  },
  {
    path: '/exception',
    name: '异常页',
    icon: <ExclamationCircleOutlined />,
    children: [
      {
        path: '/403',
        name: '403',
        disabled: true,
      },
      {
        path: '/404',
        name: '404',
        disabled: true,
      },
      {
        path: '/500',
        name: '500',
        disabled: true,
      },
    ],
  },
  {
    path: '/account',
    name: '个人页',
    icon: <UserOutlined />,
    children: [
      {
        path: '/account-center',
        name: '个人中心',
        disabled: true,
      },
      {
        path: '/account-settings',
        name: '个人设置',
        disabled: true,
      },
    ],
  },
  {
    path: '/admin-tools',
    name: '管理页',
    icon: <SettingOutlined />,
    children: [
      {
        path: '/users',
        name: '用户管理',
      },
      {
        path: '/roles',
        name: '角色管理',
      },
      {
        path: '/menus',
        name: '菜单管理',
      },
      {
        path: '/content',
        name: '内容管理',
      },
    ],
  },
];

export function AdminLayout() {
  const location = useLocation();

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
        <div className="pro-like-header__profile">
          <Avatar
            size={36}
            src="https://gw.alipayobjects.com/zos/antfincdn/CRHobKQmQx/avatar%26mail.png"
          />
          <span className="pro-like-header__name">Serati Ma</span>
        </div>
      </div>
    </header>
  );

  return (
    <ProLayout
      title="Ant Design Pro"
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
        src: 'https://gw.alipayobjects.com/zos/antfincdn/CRHobKQmQx/avatar%26mail.png',
        title: 'Serati Ma',
        size: 'small',
        render: (_, avatarChildren) => (
          <Space size={8}>
            <Avatar
              size="small"
              src="https://gw.alipayobjects.com/zos/antfincdn/CRHobKQmQx/avatar%26mail.png"
            />
            <Typography.Text style={{ color: '#8c8c8c', fontWeight: 400 }}>
              {avatarChildren}
            </Typography.Text>
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
        title={false}
        breadcrumb={undefined}
        content={false}
        style={{ padding: 0 }}
      >
        <Outlet />
      </PageContainer>
    </ProLayout>
  );
}
