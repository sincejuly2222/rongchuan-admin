import { ProCard } from '@ant-design/pro-components';
import { Col, Row, Space, Switch, Typography } from 'antd';

const settingsItems = [
  { label: '登录二次验证', value: true },
  { label: '异常登录提醒', value: true },
  { label: '自动清理日志', value: false },
  { label: '内容发布审批', value: true },
];

export function SettingsPage() {
  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      <ProCard title="系统设置" bordered>
        <Typography.Text type="secondary">
          用于展示标准后台里常见的配置总览页面，后续可继续拆成基础设置、权限策略、通知配置等模块。
        </Typography.Text>
      </ProCard>

      <Row gutter={[16, 16]}>
        {settingsItems.map((item) => (
          <Col xs={24} md={12} key={item.label}>
            <ProCard bordered>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Typography.Text strong>{item.label}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    当前为示例配置，可接真实接口。
                  </Typography.Text>
                </div>
                <Switch checked={item.value} />
              </Space>
            </ProCard>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
