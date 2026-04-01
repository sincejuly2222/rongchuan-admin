import {
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, List, Progress, Row, Typography } from 'antd';

const projects = [
  {
    name: 'Alipay',
    desc: '那是一种内在的东西，他们到达不了，也无法触及的',
    team: '科学搬砖组',
    time: '几秒前',
    color: '#1677ff',
  },
  {
    name: 'Angular',
    desc: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
    team: '全组都是吴彦祖',
    time: '9 年前',
    color: '#eb2f96',
  },
  {
    name: 'Ant Design',
    desc: '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆',
    team: '中二少女团',
    time: '几秒前',
    color: '#13c2c2',
  },
  {
    name: 'Ant Design Pro',
    desc: '那时候我只会想自己想要什么，从不想自己拥有什么',
    team: '程序员日常',
    time: '9 年前',
    color: '#722ed1',
  },
  {
    name: 'Bootstrap',
    desc: '凛冬将至',
    team: '高逼格设计天团',
    time: '9 年前',
    color: '#fa8c16',
  },
  {
    name: 'React',
    desc: '生命就像一盒巧克力，结果往往出人意料',
    team: '骗你来学计算机',
    time: '9 年前',
    color: '#2f54eb',
  },
];

const activities = [
  '曲丽丽 在 高逼格设计天团 新建项目 六月迭代',
  '付小小 在 高逼格设计天团 新建项目 六月迭代',
  '林东东 在 中二少女团 新建项目 六月迭代',
  '周星星 将 5 月日常迭代 更新至已发布状态',
  '朱偏右 在 工程效能 发布了 留言',
  '乐哥 在 程序员日常 新建项目 品牌迭代',
];

const quickLinks = [
  '操作一',
  '操作二',
  '操作三',
  '操作四',
  '操作五',
  '操作六',
];

const teams = [
  '科学搬砖组',
  '全组都是吴彦祖',
  '中二少女团',
  '程序员日常',
  '高逼格设计天团',
  '骗你来学计算机',
];

export function DashboardPage() {
  return (
    <div className="workplace-page">
      <Card bordered={false} className="workplace-hero">
        <div className="workplace-hero__content">
          <div className="workplace-hero__intro">
            <Avatar
              size={72}
              src="https://gw.alipayobjects.com/zos/antfincdn/CRHobKQmQx/avatar%26mail.png"
            />
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                早安，吴彦祖，祝你开心每一天！
              </Typography.Title>
              <Typography.Text type="secondary">
                交互专家 | 蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED
              </Typography.Text>
            </div>
          </div>

          <div className="workplace-hero__stats">
            <div>
              <Typography.Text type="secondary">项目数</Typography.Text>
              <div className="workplace-hero__stat-value">56</div>
            </div>
            <div>
              <Typography.Text type="secondary">团队内排名</Typography.Text>
              <div className="workplace-hero__stat-value">8 / 24</div>
            </div>
            <div>
              <Typography.Text type="secondary">项目访问</Typography.Text>
              <div className="workplace-hero__stat-value">2,223</div>
            </div>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card
            title="进行中的项目"
            extra={<a href="#all-projects">全部项目</a>}
            bordered={false}
          >
            <Row gutter={[16, 16]}>
              {projects.map((project) => (
                <Col xs={24} md={12} key={project.name}>
                  <div className="workplace-project">
                    <div className="workplace-project__header">
                      <Avatar
                        shape="square"
                        size={44}
                        style={{ background: project.color, color: '#fff' }}
                      >
                        {project.name.slice(0, 2)}
                      </Avatar>
                      <div>
                        <Typography.Text strong>{project.name}</Typography.Text>
                        <Typography.Paragraph
                          type="secondary"
                          style={{ margin: '4px 0 0' }}
                          ellipsis={{ rows: 2 }}
                        >
                          {project.desc}
                        </Typography.Paragraph>
                      </div>
                    </div>
                    <div className="workplace-project__meta">
                      <span>{project.team}</span>
                      <span>{project.time}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="动态" bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={<Typography.Text>{item}</Typography.Text>}
                    description={index < 3 ? '几秒前' : '今天 09:32'}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} xl={16}>
          <Card
            title="快速开始 / 便捷导航"
            extra={
              <Button type="text" icon={<PlusOutlined />}>
                添加
              </Button>
            }
            bordered={false}
          >
            <div className="workplace-links">
              {quickLinks.map((item) => (
                <a href={`#${item}`} key={item} className="workplace-links__item">
                  {item}
                </a>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="XX 指数" bordered={false}>
            <div className="workplace-chart">
              <Progress type="dashboard" percent={82} size={180} />
              <div className="workplace-chart__legend">
                <div className="workplace-chart__legend-item">
                  <span className="dot dot-blue" />
                  <span>周同比 12%</span>
                </div>
                <div className="workplace-chart__legend-item">
                  <span className="dot dot-green" />
                  <span>月同比 11%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="团队" bordered={false}>
            <div className="workplace-teams">
              {teams.map((team, index) => (
                <div key={team} className="workplace-team">
                  <Avatar
                    shape="square"
                    size={44}
                    icon={<TeamOutlined />}
                    style={{
                      background: ['#1677ff', '#13c2c2', '#722ed1', '#fa8c16', '#2f54eb', '#eb2f96'][
                        index % 6
                      ],
                    }}
                  />
                  <span>{team}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
