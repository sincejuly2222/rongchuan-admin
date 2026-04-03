import { Button, Card, Form, Input, Space, Typography, App } from 'antd';
import { useEffect } from 'react';
import { getCurrentUser, initializeAuth, updateMyProfile, useAuth } from '../auth';

type ProfileFormValues = {
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleNames: string;
};

export function ProfilePage() {
  const { message } = App.useApp();
  const auth = useAuth();
  const [form] = Form.useForm<ProfileFormValues>();
  const currentUser = auth.user ?? getCurrentUser();

  useEffect(() => {
    void initializeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    form.setFieldsValue({
      username: currentUser.username,
      name: currentUser.name ?? '',
      email: currentUser.email,
      phone: currentUser.phone ?? '',
      avatar: currentUser.avatar ?? '',
      roleNames: currentUser.roleNames.join(' / '),
    });
  }, [currentUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateMyProfile({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
        avatar: values.avatar?.trim() || null,
      });

      message.success('个人信息已更新');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <Card
      title="个人中心"
      extra={<Typography.Text type="secondary">仅可编辑当前登录人的个人资料</Typography.Text>}
      style={{ margin: 24 }}
    >
      <Form<ProfileFormValues> form={form} layout="vertical">
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Title level={5} style={{ marginBottom: 0 }}>基础信息</Typography.Title>
          <Typography.Text type="secondary">用户名和角色信息只读，姓名、邮箱、手机号、头像地址可编辑。</Typography.Text>
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
          <Button type="primary" onClick={() => void handleSubmit()}>
            保存修改
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
