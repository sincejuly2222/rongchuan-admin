import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link, useParams } from 'react-router-dom';
import {
  endpoints,
  methodColor,
  type ApiModule,
  type HttpMethod,
} from '../DashboardPage';
import '../DashboardPage/index.less';
import './index.less';

type ParameterPosition = 'path' | 'query' | 'body' | 'formData' | 'header';

type ApiParameter = {
  key: string;
  name: string;
  position: ParameterPosition;
  required: boolean;
  type: string;
  description: string;
  example: string;
};

const parameterColumns: ColumnsType<ApiParameter> = [
  {
    title: '参数名',
    dataIndex: 'name',
    width: 180,
    render: (name: string) => <Typography.Text code>{name}</Typography.Text>,
  },
  {
    title: '位置',
    dataIndex: 'position',
    width: 110,
    render: (position: ParameterPosition) => <Tag>{position}</Tag>,
  },
  {
    title: '必填',
    dataIndex: 'required',
    width: 90,
    render: (required: boolean) => (
      <Tag color={required ? 'volcano' : 'default'}>{required ? '是' : '否'}</Tag>
    ),
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 140,
  },
  {
    title: '说明',
    dataIndex: 'description',
  },
  {
    title: '示例',
    dataIndex: 'example',
    width: 180,
    render: (example: string) => <Typography.Text type="secondary">{example}</Typography.Text>,
  },
];

function createParameter(
  name: string,
  position: ParameterPosition,
  required: boolean,
  type: string,
  description: string,
  example: string,
): ApiParameter {
  return {
    key: `${position}-${name}`,
    name,
    position,
    required,
    type,
    description,
    example,
  };
}

function getPathParameters(path: string) {
  return Array.from(path.matchAll(/:([a-zA-Z0-9_]+)/g)).map((match) =>
    createParameter(match[1], 'path', true, 'number | string', '路径资源 ID', '1'),
  );
}

function getListQueryParameters(moduleKey: string) {
  const common = [
    createParameter('current', 'query', false, 'number', '当前页码', '1'),
    createParameter('pageSize', 'query', false, 'number', '每页条数', '10'),
  ];

  const moduleQueries: Record<string, ApiParameter[]> = {
    users: [
      createParameter('username', 'query', false, 'string', '用户名模糊搜索', 'admin'),
      createParameter('name', 'query', false, 'string', '姓名模糊搜索', '张三'),
      createParameter('status', 'query', false, '0 | 1', '用户状态', '1'),
    ],
    roles: [
      createParameter('roleName', 'query', false, 'string', '角色名称', '管理员'),
      createParameter('roleCode', 'query', false, 'string', '角色编码', 'admin'),
      createParameter('status', 'query', false, '0 | 1', '角色状态', '1'),
    ],
    menus: [
      createParameter('menuName', 'query', false, 'string', '菜单名称', '首页'),
      createParameter('status', 'query', false, '0 | 1', '菜单状态', '1'),
    ],
    organizations: [
      createParameter('name', 'query', false, 'string', '组织名称', '校友会'),
      createParameter('status', 'query', false, '0 | 1', '组织状态', '1'),
    ],
    activities: [
      createParameter('title', 'query', false, 'string', '活动标题', '返校日'),
      createParameter('status', 'query', false, '0 | 1', '活动状态', '1'),
    ],
    blogs: [
      createParameter('keyword', 'query', false, 'string', '标题或内容关键字', '公告'),
      createParameter('categoryId', 'query', false, 'number', '分类 ID', '1'),
      createParameter('status', 'query', false, 'number', '发布状态', '1'),
    ],
    'blog-comments': [
      createParameter('blogId', 'query', false, 'number', '博客 ID', '1'),
      createParameter('status', 'query', false, 'number', '评论状态', '1'),
    ],
    'alumni-users': [
      createParameter('name', 'query', false, 'string', '校友姓名', '李雷'),
      createParameter('phone', 'query', false, 'string', '手机号', '13800000000'),
      createParameter('status', 'query', false, '0 | 1', '账号状态', '1'),
    ],
    'alumni-exchanges': [
      createParameter('keyword', 'query', false, 'string', '交流内容关键字', '招聘'),
      createParameter('status', 'query', false, 'number', '内容状态', '1'),
    ],
    'student-records': [
      createParameter('name', 'query', false, 'string', '学生姓名', '王五'),
      createParameter('status', 'query', false, 'number', '记录状态', '1'),
    ],
    'import-jobs': [
      createParameter('status', 'query', false, 'string', '导入任务状态', 'completed'),
    ],
  };

  return [...common, ...(moduleQueries[moduleKey] ?? [])];
}

function getQueryParameters(endpoint: (typeof endpoints)[number]) {
  if (endpoint.method !== 'GET') {
    return [];
  }

  if (endpoint.path.includes('/:id') || endpoint.path === '/api/health') {
    return [];
  }

  if (endpoint.moduleKey === 'juejin' && endpoint.path !== '/api/juejin/categories') {
    return [
      createParameter('cursor', 'query', false, 'string', '分页游标', '0'),
      createParameter('limit', 'query', false, 'number', '返回数量', '20'),
    ];
  }

  if (endpoint.path.includes('/tree') || endpoint.path.includes('/categories')) {
    return [];
  }

  return getListQueryParameters(endpoint.moduleKey);
}

function getBodyParameters(endpoint: (typeof endpoints)[number]) {
  const { method, moduleKey, path } = endpoint;

  if (method === 'GET' || method === 'DELETE') {
    return [];
  }

  if (path.includes('/upload')) {
    return [createParameter('file', 'formData', true, 'File', 'Excel 导入文件', 'students.xlsx')];
  }

  if (path.endsWith('/status')) {
    return [createParameter('status', 'body', true, 'number', '目标状态值', '1')];
  }

  if (path === '/api/auth/login') {
    return [
      createParameter('username', 'body', true, 'string', '用户名', 'admin'),
      createParameter('encryptedPassword', 'body', true, 'string', 'RSA-OAEP-256 加密后的密码', '<base64>'),
      createParameter('remember', 'body', false, 'boolean', '是否保持登录', 'true'),
    ];
  }

  if (path === '/api/auth/register') {
    return [
      createParameter('username', 'body', true, 'string', '用户名', 'new_admin'),
      createParameter('email', 'body', true, 'string', '邮箱', 'new_admin@rongchuan.local'),
      createParameter('password', 'body', true, 'string', '密码', '123456'),
      createParameter('avatar', 'body', false, 'string | null', '头像 URL', 'null'),
    ];
  }

  if (path === '/api/auth/profile') {
    return [
      createParameter('name', 'body', true, 'string', '姓名', '系统管理员'),
      createParameter('email', 'body', true, 'string', '邮箱', 'admin@rongchuan.local'),
      createParameter('phone', 'body', false, 'string | null', '手机号', '13800000000'),
      createParameter('avatar', 'body', false, 'string | null', '头像 URL', 'null'),
    ];
  }

  if (path === '/api/roles/:id/menus') {
    return [
      createParameter('menuIds', 'body', true, 'number[]', '菜单 ID 列表', '[1, 2, 3]'),
    ];
  }

  if (path === '/api/blogs/categories/sort') {
    return [
      createParameter('categoryIds', 'body', true, 'number[]', '排序后的分类 ID 列表', '[3, 1, 2]'),
    ];
  }

  const moduleBodies: Record<string, ApiParameter[]> = {
    users: [
      createParameter('username', 'body', true, 'string', '用户名', 'zhangsan'),
      createParameter('password', 'body', method === 'POST', 'string', '密码，编辑时可不传', '123456'),
      createParameter('name', 'body', false, 'string', '姓名', '张三'),
      createParameter('email', 'body', true, 'string', '邮箱', 'zhangsan@rongchuan.local'),
      createParameter('phone', 'body', false, 'string | null', '手机号', '13800000000'),
      createParameter('status', 'body', false, '0 | 1', '账号状态', '1'),
      createParameter('roleIds', 'body', false, 'number[]', '角色 ID 列表', '[1, 2]'),
    ],
    roles: [
      createParameter('roleName', 'body', true, 'string', '角色名称', '运营管理员'),
      createParameter('roleCode', 'body', true, 'string', '角色编码', 'operator'),
      createParameter('description', 'body', false, 'string | null', '角色描述', '负责内容运营'),
      createParameter('status', 'body', false, '0 | 1', '角色状态', '1'),
    ],
    menus: [
      createParameter('parentId', 'body', false, 'number', '父级菜单 ID', '0'),
      createParameter('menuName', 'body', true, 'string', '菜单名称', '用户管理'),
      createParameter('menuCode', 'body', true, 'string', '菜单编码', 'users'),
      createParameter('path', 'body', false, 'string | null', '前端路由', '/users'),
      createParameter('component', 'body', false, 'string | null', '组件路径', 'views/UsersPage'),
      createParameter('icon', 'body', false, 'string | null', '菜单图标', 'UserOutlined'),
      createParameter('sortOrder', 'body', false, 'number', '排序值', '10'),
      createParameter('status', 'body', false, '0 | 1', '菜单状态', '1'),
    ],
    organizations: [
      createParameter('name', 'body', true, 'string', '组织名称', '北京校友会'),
      createParameter('description', 'body', false, 'string | null', '组织说明', '北京地区校友组织'),
      createParameter('status', 'body', false, '0 | 1', '组织状态', '1'),
    ],
    activities: [
      createParameter('title', 'body', true, 'string', '活动标题', '校友返校日'),
      createParameter('description', 'body', false, 'string | null', '活动说明', '年度返校活动'),
      createParameter('startTime', 'body', false, 'string', '开始时间', '2026-05-01 09:00:00'),
      createParameter('endTime', 'body', false, 'string', '结束时间', '2026-05-01 18:00:00'),
      createParameter('status', 'body', false, 'number', '活动状态', '1'),
    ],
    blogs: [
      createParameter('title', 'body', true, 'string', '文章标题', '校友活动回顾'),
      createParameter('content', 'body', true, 'string', '文章内容', '这里是正文内容'),
      createParameter('categoryId', 'body', false, 'number', '分类 ID', '1'),
      createParameter('status', 'body', false, 'number', '发布状态', '1'),
      createParameter('cover', 'body', false, 'string | null', '封面图 URL', 'null'),
    ],
    'blog-comments': [
      createParameter('status', 'body', false, 'number', '评论状态', '1'),
      createParameter('content', 'body', false, 'string', '评论内容', '更新后的评论'),
    ],
    'alumni-users': [
      createParameter('name', 'body', true, 'string', '校友姓名', '李雷'),
      createParameter('phone', 'body', false, 'string | null', '手机号', '13800000000'),
      createParameter('email', 'body', false, 'string | null', '邮箱', 'lilei@example.com'),
      createParameter('graduationYear', 'body', false, 'number', '毕业年份', '2020'),
      createParameter('status', 'body', false, '0 | 1', '账号状态', '1'),
    ],
    'alumni-exchanges': [
      createParameter('title', 'body', true, 'string', '交流标题', '招聘内推'),
      createParameter('content', 'body', true, 'string', '交流内容', '欢迎校友联系'),
      createParameter('status', 'body', false, 'number', '内容状态', '1'),
    ],
  };

  if (path.endsWith('/student-record')) {
    return [
      createParameter('studentNo', 'body', true, 'string', '学号', '20200001'),
      createParameter('college', 'body', false, 'string', '学院', '计算机学院'),
      createParameter('major', 'body', false, 'string', '专业', '软件工程'),
      createParameter('graduationYear', 'body', false, 'number', '毕业年份', '2024'),
    ];
  }

  if (path.endsWith('/card')) {
    return [
      createParameter('cardNo', 'body', true, 'string', '校友卡号', 'RC20260001'),
      createParameter('level', 'body', false, 'string', '卡片等级', 'gold'),
      createParameter('expiredAt', 'body', false, 'string | null', '过期时间', '2027-04-21'),
    ];
  }

  if (path.includes('/categories')) {
    return [
      createParameter('name', 'body', true, 'string', '分类名称', '校园资讯'),
      createParameter('sortOrder', 'body', false, 'number', '排序值', '10'),
      createParameter('status', 'body', false, 'number', '分类状态', '1'),
    ];
  }

  return moduleBodies[moduleKey] ?? [];
}

function getParameters(endpoint: (typeof endpoints)[number]) {
  const authParameters =
    endpoint.auth === '公开'
      ? []
      : [
          createParameter(
            'Authorization',
            'header',
            true,
            'Bearer token',
            '登录后获得的访问令牌',
            'Bearer <accessToken>',
          ),
        ];

  return [
    ...authParameters,
    ...getPathParameters(endpoint.path),
    ...getQueryParameters(endpoint),
    ...getBodyParameters(endpoint),
  ];
}

function createBodySample(parameters: ApiParameter[]) {
  return parameters
    .filter((parameter) => parameter.position === 'body')
    .reduce<Record<string, string | number | boolean | null | number[]>>((sample, parameter) => {
      if (parameter.example === 'null') {
        sample[parameter.name] = null;
      } else if (parameter.type.includes('number[]')) {
        sample[parameter.name] = [1, 2, 3];
      } else if (parameter.type.includes('number') || parameter.type.includes('0 | 1')) {
        sample[parameter.name] = Number(parameter.example) || 1;
      } else if (parameter.type.includes('boolean')) {
        sample[parameter.name] = parameter.example === 'true';
      } else {
        sample[parameter.name] = parameter.example;
      }

      return sample;
    }, {});
}

function getExampleUrl(endpoint: (typeof endpoints)[number], parameters: ApiParameter[]) {
  const path = endpoint.path.replace(/:([a-zA-Z0-9_]+)/g, (_, name: string) => {
    const parameter = parameters.find((item) => item.name === name && item.position === 'path');
    return parameter?.example ?? '1';
  });

  const query = parameters
    .filter((parameter) => parameter.position === 'query')
    .slice(0, 3)
    .map((parameter) => `${parameter.name}=${encodeURIComponent(parameter.example)}`)
    .join('&');

  return query ? `${path}?${query}` : path;
}

function createCurlExample(endpoint: (typeof endpoints)[number], parameters: ApiParameter[]) {
  const url = getExampleUrl(endpoint, parameters);
  const hasAuth = parameters.some((parameter) => parameter.name === 'Authorization');
  const formData = parameters.find((parameter) => parameter.position === 'formData');
  const bodySample = createBodySample(parameters);
  const hasBody = Object.keys(bodySample).length > 0;
  const lines = [`curl -X ${endpoint.method} "http://localhost:3000${url}"`];

  if (hasAuth) {
    lines.push('  -H "Authorization: Bearer <accessToken>"');
  }

  if (formData) {
    lines.push(`  -F "${formData.name}=@${formData.example}"`);
  } else if (hasBody) {
    lines.push('  -H "Content-Type: application/json"');
    lines.push(`  -d '${JSON.stringify(bodySample, null, 2)}'`);
  }

  return lines.join(' \\\n');
}

function createFetchExample(endpoint: (typeof endpoints)[number], parameters: ApiParameter[]) {
  const url = getExampleUrl(endpoint, parameters);
  const hasAuth = parameters.some((parameter) => parameter.name === 'Authorization');
  const bodySample = createBodySample(parameters);
  const hasBody = Object.keys(bodySample).length > 0;
  const headers: Record<string, string> = {};

  if (hasAuth) {
    headers.Authorization = 'Bearer <accessToken>';
  }

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  return `const response = await fetch(\`${url}\`, {
  method: '${endpoint.method}',${Object.keys(headers).length > 0 ? `\n  headers: ${JSON.stringify(headers, null, 2)},` : ''}${hasBody ? `\n  body: JSON.stringify(${JSON.stringify(bodySample, null, 2)}),` : ''}
  credentials: 'include',
});

const payload = await response.json();`;
}

function getResponseNote(auth: ApiModule['auth']) {
  if (auth === '公开') {
    return '公开接口不强制要求登录，正常响应统一使用 { code, message, data } 结构。';
  }

  if (auth === '部分公开') {
    return '该模块包含公开与登录保护接口；保护接口未登录时会返回 401，需要重新登录。';
  }

  return '该接口需要登录态，需携带 Authorization 请求头；业务数据位于响应 data 字段。';
}

export function ApiDetailPage() {
  const { apiId } = useParams();
  const endpoint = endpoints.find((item) => item.id === apiId);

  if (!endpoint) {
    return (
      <div className="api-dashboard-page">
        <Card variant="borderless" className="api-dashboard-card">
          <Empty description="未找到接口详情" />
          <Link to="/dashboard">
            <Button type="primary">返回接口统计</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const parameters = getParameters(endpoint);
  const curlExample = createCurlExample(endpoint, parameters);
  const fetchExample = createFetchExample(endpoint, parameters);

  return (
    <div className="api-dashboard-page api-detail-page">
      <div className="api-detail-page__toolbar">
        <Link to="/dashboard">
          <Button icon={<ArrowLeftOutlined />}>返回接口统计</Button>
        </Link>
      </div>

      <section className="api-dashboard-hero api-detail-hero">
        <div className="api-dashboard-hero__copy">
          <Space size={10} wrap>
            <Tag color={methodColor[endpoint.method as HttpMethod]}>{endpoint.method}</Tag>
            <Tag color={endpoint.auth === '公开' ? 'default' : endpoint.auth === '部分公开' ? 'cyan' : 'volcano'}>
              {endpoint.auth}
            </Tag>
            <Typography.Text className="api-dashboard-hero__eyebrow">
              {endpoint.moduleName}
            </Typography.Text>
          </Space>
          <Typography.Title level={2}>{endpoint.summary}</Typography.Title>
          <Typography.Paragraph>
            <Typography.Text code>{endpoint.path}</Typography.Text>
          </Typography.Paragraph>
        </div>

        <div className="api-detail-hero__module">
          <span>所属模块</span>
          <strong>{endpoint.moduleName}</strong>
          <Typography.Text>{endpoint.moduleDescription}</Typography.Text>
        </div>
      </section>

      <Card variant="borderless" className="api-dashboard-card">
        <Descriptions column={{ xs: 1, md: 2 }} bordered>
          <Descriptions.Item label="请求方法">{endpoint.method}</Descriptions.Item>
          <Descriptions.Item label="接口地址">{endpoint.path}</Descriptions.Item>
          <Descriptions.Item label="模块">{endpoint.moduleName}</Descriptions.Item>
          <Descriptions.Item label="鉴权">{endpoint.auth}</Descriptions.Item>
          <Descriptions.Item label="响应说明" span={2}>
            {getResponseNote(endpoint.auth)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card variant="borderless" className="api-dashboard-card" title="参数说明">
        {parameters.length > 0 ? (
          <Table
            columns={parameterColumns}
            dataSource={parameters}
            pagination={false}
            scroll={{ x: 900 }}
          />
        ) : (
          <Empty description="该接口无显式请求参数" />
        )}
      </Card>

      <Card variant="borderless" className="api-dashboard-card" title="请求示例">
        <div className="api-detail-examples">
          <div>
            <Typography.Title level={5}>curl</Typography.Title>
            <Typography.Paragraph copyable>
              <pre>{curlExample}</pre>
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Title level={5}>fetch</Typography.Title>
            <Typography.Paragraph copyable>
              <pre>{fetchExample}</pre>
            </Typography.Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}
