import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Button, Card, Checkbox, Form, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  initializeAuth,
  isAuthenticated,
  login,
  loginWithDevBypass,
  useAuth,
} from '../../auth';
import './index.less';

type LoginFormValues = {
  username: string;
  password: string;
  remember?: boolean;
};

export function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void initializeAuth();
  }, []);

  useEffect(() => {
    if (auth.initialized && isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.initialized, navigate]);

  const handleFinish = async (values: LoginFormValues) => {
    try {
      setSubmitting(true);
      const payload = await login(values);
      message.success(`欢迎回来，${payload.user.name || payload.user.username}`);

      const targetPath =
        typeof location.state === 'object' &&
          location.state &&
          'from' in location.state &&
          typeof location.state.from === 'string'
          ? location.state.from
          : '/dashboard';

      navigate(targetPath, { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevBypass = () => {
    loginWithDevBypass();

    const targetPath =
      typeof location.state === 'object' &&
        location.state &&
        'from' in location.state &&
        typeof location.state.from === 'string'
        ? location.state.from
        : '/dashboard';

    navigate(targetPath, { replace: true });
  };

  void handleDevBypass;

  return (
    <div className="login-page">
      <div className="login-page__backdrop" />
      <video
        className="login-page__video"
        src="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/4mH9SrLaoIQAAAAAAAAAAAAAK4eUAQBr"
        autoPlay
        playsInline
        loop
        crossOrigin="anonymous"
        muted
      />

      <div className="login-page__shell">
        <section className="login-page__hero">
          <div className="login-page__brand">
            <div className="login-page__brand-mark">RC</div>
            <div>
              <Typography.Text className="login-page__eyebrow">
                Rongchuan Admin
              </Typography.Text>
              <Typography.Title level={1} className="login-page__title">
                欢迎登录容川后台管理系统
              </Typography.Title>
              <Typography.Paragraph className="login-page__subtitle">
                统一处理用户、角色、菜单与内容管理
              </Typography.Paragraph>
            </div>
          </div>
        </section>

        <Card variant="borderless" className="login-card">
          <div className="login-card__header">
            <Typography.Title level={3}>账号登录</Typography.Title>
          </div>

          <Form<LoginFormValues>
            layout="vertical"
            size="large"
            initialValues={{ remember: true }}
            onFinish={handleFinish}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名，例如：admin"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <div className="login-card__meta">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>7 天内免重复登录</Checkbox>
              </Form.Item>
              {/* <a href="#reset-password">忘记密码</a> */}
            </div>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                登录系统
              </Button>
            </Form.Item>
          </Form>

          <div className="login-card__footer">
            <Space size={6}>
              <SafetyCertificateOutlined />
              <span>推荐使用 Chrome / Edge 获取最佳体验</span>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
