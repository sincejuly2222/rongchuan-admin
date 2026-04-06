import { Button, Card, Form, Input, Space, Typography } from 'antd';
import type { FormInstance } from 'antd';
import type { ProfileFormValues } from '../../types';
import './index.less';

type ProfileCardProps = {
  form: FormInstance<ProfileFormValues>;
  onSubmit: () => void;
};

export function ProfileCard({ form, onSubmit }: ProfileCardProps) {
  return (
    <div className="page-card-wrap">
      <Card
        title="个人中心"
        extra={<Typography.Text type="secondary">仅可编辑当前登录人的个人资料</Typography.Text>}
      >
        <Form<ProfileFormValues> form={form} layout="vertical">
          <Space direction="vertical" size={4} className="full-width">
            <Typography.Title level={5} style={{ marginBottom: 0 }}>基础信息</Typography.Title>
            <Typography.Text type="secondary">
              用户名和角色信息只读，姓名、邮箱、手机号和头像地址可编辑。
            </Typography.Text>
          </Space>

          <Form.Item label="用户名" name="username">
            <Input disabled />
          </Form.Item>

          <Form.Item label="角色" name="roleNames">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="头像地址" name="avatar">
            <Input placeholder="请输入头像 URL" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" onClick={onSubmit}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
