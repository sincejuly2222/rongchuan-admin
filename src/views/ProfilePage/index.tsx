import { App, Form } from 'antd';
import { useEffect } from 'react';
import { getCurrentUser, initializeAuth, updateMyProfile, useAuth } from '../../auth';
import { ProfileCard } from './components/ProfileCard';
import type { ProfileFormValues } from './types';
import './index.less';

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
    <div className="page-root">
      <ProfileCard form={form} onSubmit={() => void handleSubmit()} />
    </div>
  );
}
