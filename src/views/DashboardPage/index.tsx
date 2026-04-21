/* eslint-disable react-refresh/only-export-components */
import {
  ApiOutlined,
  AppstoreOutlined,
  LockOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Progress, Row, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import './index.less';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiModule = {
  key: string;
  name: string;
  description: string;
  auth: '公开' | '需登录' | '部分公开';
  endpoints: {
    method: HttpMethod;
    path: string;
    summary: string;
  }[];
};

export const methodColor: Record<HttpMethod, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'gold',
  DELETE: 'red',
};

export const apiModules: ApiModule[] = [
  {
    key: 'health',
    name: '健康检查',
    description: '服务与数据库可用性检测',
    auth: '公开',
    endpoints: [{ method: 'GET', path: '/api/health', summary: '检查服务健康状态' }],
  },
  {
    key: 'auth',
    name: '认证中心',
    description: '登录、注册、令牌刷新与当前用户资料',
    auth: '部分公开',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', summary: '注册后台账号' },
      { method: 'GET', path: '/api/auth/login-public-key', summary: '获取登录密码加密公钥' },
      { method: 'POST', path: '/api/auth/login', summary: '登录后台系统' },
      { method: 'POST', path: '/api/auth/refresh', summary: '刷新访问令牌' },
      { method: 'POST', path: '/api/auth/logout', summary: '退出登录' },
      { method: 'GET', path: '/api/auth/bootstrap', summary: '获取登录后的基础权限数据' },
      { method: 'GET', path: '/api/auth/me', summary: '获取当前登录用户' },
      { method: 'PUT', path: '/api/auth/profile', summary: '更新当前用户资料' },
    ],
  },
  {
    key: 'blogs',
    name: '博客内容',
    description: '博客文章、分类、发布状态与编辑详情',
    auth: '部分公开',
    endpoints: [
      { method: 'GET', path: '/api/blogs/categories', summary: '获取公开博客分类' },
      { method: 'GET', path: '/api/blogs/categories/manage', summary: '管理端分类列表' },
      { method: 'POST', path: '/api/blogs/categories', summary: '创建博客分类' },
      { method: 'PUT', path: '/api/blogs/categories/:id', summary: '更新博客分类' },
      { method: 'DELETE', path: '/api/blogs/categories/:id', summary: '删除博客分类' },
      { method: 'PATCH', path: '/api/blogs/categories/sort', summary: '调整分类排序' },
      { method: 'GET', path: '/api/blogs', summary: '查询博客列表' },
      { method: 'GET', path: '/api/blogs/:id/edit', summary: '获取可编辑博客详情' },
      { method: 'GET', path: '/api/blogs/:id', summary: '获取公开博客详情' },
      { method: 'POST', path: '/api/blogs', summary: '创建博客文章' },
      { method: 'PUT', path: '/api/blogs/:id', summary: '更新博客文章' },
      { method: 'PATCH', path: '/api/blogs/:id/status', summary: '更新博客发布状态' },
      { method: 'DELETE', path: '/api/blogs/:id', summary: '删除博客文章' },
    ],
  },
  {
    key: 'blog-comments',
    name: '博客评论',
    description: '评论列表、审核状态与删除',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/blog-comments', summary: '查询评论列表' },
      { method: 'PATCH', path: '/api/blog-comments/:id', summary: '更新评论状态或内容' },
      { method: 'DELETE', path: '/api/blog-comments/:id', summary: '删除评论' },
    ],
  },
  {
    key: 'activities',
    name: '活动管理',
    description: '活动列表、新增、编辑与状态切换',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/activities', summary: '查询活动列表' },
      { method: 'POST', path: '/api/activities', summary: '创建活动' },
      { method: 'PUT', path: '/api/activities/:id', summary: '更新活动' },
      { method: 'PATCH', path: '/api/activities/:id/status', summary: '更新活动状态' },
    ],
  },
  {
    key: 'alumni-users',
    name: '校友用户',
    description: '校友档案、学生记录与卡片信息维护',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/alumni-users', summary: '查询校友用户列表' },
      { method: 'POST', path: '/api/alumni-users', summary: '创建校友用户' },
      { method: 'GET', path: '/api/alumni-users/:id', summary: '获取校友用户详情' },
      { method: 'PUT', path: '/api/alumni-users/:id', summary: '更新校友用户' },
      { method: 'PATCH', path: '/api/alumni-users/:id/status', summary: '更新校友用户状态' },
      { method: 'PUT', path: '/api/alumni-users/:id/student-record', summary: '维护学生记录' },
      { method: 'PUT', path: '/api/alumni-users/:id/card', summary: '维护校友卡片' },
    ],
  },
  {
    key: 'alumni-exchanges',
    name: '校友交流',
    description: '交流内容列表、创建与状态维护',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/alumni-exchanges', summary: '查询交流内容' },
      { method: 'POST', path: '/api/alumni-exchanges', summary: '创建交流内容' },
      { method: 'PATCH', path: '/api/alumni-exchanges/:id/status', summary: '更新交流内容状态' },
    ],
  },
  {
    key: 'import-jobs',
    name: '导入任务',
    description: 'Excel 导入任务列表与文件上传',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/import-jobs', summary: '查询导入任务' },
      { method: 'POST', path: '/api/import-jobs/upload', summary: '上传导入文件' },
    ],
  },
  {
    key: 'juejin',
    name: '掘金数据',
    description: '分类、热榜与前端热榜代理接口',
    auth: '公开',
    endpoints: [
      { method: 'GET', path: '/api/juejin/categories', summary: '获取掘金分类' },
      { method: 'GET', path: '/api/juejin/hot-rank', summary: '获取综合热榜' },
      { method: 'GET', path: '/api/juejin/hot-frontend', summary: '获取前端热榜' },
    ],
  },
  {
    key: 'organizations',
    name: '组织管理',
    description: '组织列表、新增、编辑与状态切换',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/organizations', summary: '查询组织列表' },
      { method: 'POST', path: '/api/organizations', summary: '创建组织' },
      { method: 'PUT', path: '/api/organizations/:id', summary: '更新组织' },
      { method: 'PATCH', path: '/api/organizations/:id/status', summary: '更新组织状态' },
    ],
  },
  {
    key: 'student-records',
    name: '学籍记录',
    description: '学生记录列表与状态维护',
    auth: '需登录',
    endpoints: [
      { method: 'GET', path: '/api/student-records', summary: '查询学籍记录' },
      { method: 'PATCH', path: '/api/student-records/:id/status', summary: '更新学籍记录状态' },
    ],
  },
  {
    key: 'users',
    name: '后台用户',
    description: '后台账号列表、新增、编辑与启停',
    auth: '需登录',
    endpoints: [
      { method: 'POST', path: '/api/users', summary: '创建后台用户' },
      { method: 'GET', path: '/api/users', summary: '查询后台用户' },
      { method: 'PUT', path: '/api/users/:id', summary: '更新后台用户' },
      { method: 'PATCH', path: '/api/users/:id/status', summary: '更新用户状态' },
    ],
  },
  {
    key: 'roles',
    name: '角色管理',
    description: '角色列表、角色维护与菜单绑定',
    auth: '需登录',
    endpoints: [
      { method: 'POST', path: '/api/roles', summary: '创建角色' },
      { method: 'GET', path: '/api/roles', summary: '查询角色列表' },
      { method: 'PUT', path: '/api/roles/:id', summary: '更新角色' },
      { method: 'GET', path: '/api/roles/:id/menus', summary: '获取角色菜单' },
      { method: 'PUT', path: '/api/roles/:id/menus', summary: '更新角色菜单' },
    ],
  },
  {
    key: 'menus',
    name: '菜单管理',
    description: '菜单列表、菜单树、维护与删除',
    auth: '需登录',
    endpoints: [
      { method: 'POST', path: '/api/menus', summary: '创建菜单' },
      { method: 'GET', path: '/api/menus', summary: '查询菜单列表' },
      { method: 'GET', path: '/api/menus/tree', summary: '查询菜单树' },
      { method: 'PUT', path: '/api/menus/:id', summary: '更新菜单' },
      { method: 'PATCH', path: '/api/menus/:id/status', summary: '更新菜单状态' },
      { method: 'DELETE', path: '/api/menus/:id', summary: '删除菜单' },
    ],
  },
];

export function createEndpointId(method: HttpMethod, path: string) {
  return `${method}-${path}`
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export const endpoints = apiModules.flatMap((module) =>
  module.endpoints.map((endpoint) => ({
    ...endpoint,
    id: createEndpointId(endpoint.method, endpoint.path),
    key: `${endpoint.method}-${endpoint.path}`,
    moduleKey: module.key,
    moduleName: module.name,
    moduleDescription: module.description,
    auth: module.auth,
  })),
);

const methodStats = endpoints.reduce(
  (stats, endpoint) => {
    stats[endpoint.method] += 1;
    return stats;
  },
  { GET: 0, POST: 0, PUT: 0, PATCH: 0, DELETE: 0 } as Record<HttpMethod, number>,
);

const protectedEndpointCount = endpoints.filter((endpoint) => endpoint.auth === '需登录').length;
const partialEndpointCount = endpoints.filter((endpoint) => endpoint.auth === '部分公开').length;
const authCoverage = Math.round(
  ((protectedEndpointCount + partialEndpointCount) / endpoints.length) * 100,
);

const endpointColumns: ColumnsType<(typeof endpoints)[number]> = [
  {
    title: '方法',
    dataIndex: 'method',
    width: 96,
    render: (method: HttpMethod) => <Tag color={methodColor[method]}>{method}</Tag>,
  },
  {
    title: '接口地址',
    dataIndex: 'path',
    render: (path: string) => <Typography.Text code>{path}</Typography.Text>,
  },
  {
    title: '模块',
    dataIndex: 'moduleName',
    width: 140,
  },
  {
    title: '说明',
    dataIndex: 'summary',
  },
  {
    title: '鉴权',
    dataIndex: 'auth',
    width: 100,
    render: (auth: ApiModule['auth']) => (
      <Tag color={auth === '公开' ? 'default' : auth === '部分公开' ? 'cyan' : 'volcano'}>
        {auth}
      </Tag>
    ),
  },
  {
    title: '操作',
    key: 'action',
    width: 96,
    fixed: 'right',
    render: (_, record) => (
      <Link to={`/dashboard/apis/${record.id}`}>
        <Button type="link" size="small">
          详情
        </Button>
      </Link>
    ),
  },
];

export function DashboardPage() {
  const busiestModule = apiModules.reduce((current, item) =>
    item.endpoints.length > current.endpoints.length ? item : current,
  );

  return (
    <div className="api-dashboard-page">
      <section className="api-dashboard-hero">
        <div className="api-dashboard-hero__copy">
          <Typography.Text className="api-dashboard-hero__eyebrow">API Inventory</Typography.Text>
          <Typography.Title level={2}>项目接口统计</Typography.Title>
          <Typography.Paragraph>
            基于后端 Express 路由梳理当前管理端接口资产，覆盖模块、请求方法、鉴权范围与接口明细。
          </Typography.Paragraph>
        </div>

        <div className="api-dashboard-hero__metrics">
          <div>
            <span>接口总数</span>
            <strong>{endpoints.length}</strong>
          </div>
          <div>
            <span>业务模块</span>
            <strong>{apiModules.length}</strong>
          </div>
          <div>
            <span>鉴权覆盖</span>
            <strong>{authCoverage}%</strong>
          </div>
        </div>
      </section>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card variant="borderless" className="api-dashboard-card">
            <div className="api-dashboard-section-title">
              <div>
                <Typography.Title level={4}>方法分布</Typography.Title>
                <Typography.Text type="secondary">按 HTTP Method 汇总所有已注册接口。</Typography.Text>
              </div>
              <ThunderboltOutlined />
            </div>

            <div className="method-grid">
              {(Object.keys(methodStats) as HttpMethod[]).map((method) => (
                <div className="method-grid__item" key={method}>
                  <div className="method-grid__head">
                    <Tag color={methodColor[method]}>{method}</Tag>
                    <span>{methodStats[method]} 个</span>
                  </div>
                  <Progress
                    percent={Math.round((methodStats[method] / endpoints.length) * 100)}
                    showInfo={false}
                    strokeColor="var(--api-dashboard-accent)"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card variant="borderless" className="api-dashboard-card api-dashboard-card--focus">
            <div className="api-dashboard-section-title">
              <div>
                <Typography.Title level={4}>覆盖概览</Typography.Title>
                <Typography.Text type="secondary">快速定位接口最密集的能力域。</Typography.Text>
              </div>
              <ApiOutlined />
            </div>

            <Space direction="vertical" size={18} className="api-dashboard-focus">
              <div>
                <span>接口最多模块</span>
                <strong>{busiestModule.name}</strong>
                <Typography.Text type="secondary">
                  {busiestModule.endpoints.length} 个接口，覆盖{busiestModule.description}
                </Typography.Text>
              </div>
              <div>
                <span>登录保护接口</span>
                <strong>{protectedEndpointCount}</strong>
                <Typography.Text type="secondary">
                  另有 {partialEndpointCount} 个接口所在模块为部分公开。
                </Typography.Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className="api-dashboard-card api-dashboard-modules">
        <div className="api-dashboard-section-title">
          <div>
            <Typography.Title level={4}>模块统计</Typography.Title>
            <Typography.Text type="secondary">每个模块对应一个后端路由文件。</Typography.Text>
          </div>
          <AppstoreOutlined />
        </div>

        <div className="module-grid">
          {apiModules.map((module) => (
            <div className="module-card" key={module.key}>
              <div className="module-card__top">
                <div>
                  <Typography.Text strong>{module.name}</Typography.Text>
                  <Typography.Paragraph type="secondary">{module.description}</Typography.Paragraph>
                </div>
                <strong>{module.endpoints.length}</strong>
              </div>
              <div className="module-card__bottom">
                <Tag color={module.auth === '公开' ? 'default' : module.auth === '部分公开' ? 'cyan' : 'volcano'}>
                  {module.auth}
                </Tag>
                <span>{module.key}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        variant="borderless"
        className="api-dashboard-card"
        title={
          <Space>
            <LockOutlined />
            <span>接口清单</span>
          </Space>
        }
      >
        <Table
          columns={endpointColumns}
          dataSource={endpoints}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
