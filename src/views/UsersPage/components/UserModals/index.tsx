import { Form, Input, Modal, Select } from 'antd';
import type { FormInstance } from 'antd';
import type {
  CreateUserFormValues,
  EditUserFormValues,
  ResetPasswordFormValues,
  RoleOption,
  UserRecord,
} from '../../types';
import './index.less';

type UserModalsProps = {
  createForm: FormInstance<CreateUserFormValues>;
  editForm: FormInstance<EditUserFormValues>;
  resetPasswordForm: FormInstance<ResetPasswordFormValues>;
  currentRecord: UserRecord | null;
  roleOptions: RoleOption[];
  createModalOpen: boolean;
  editModalOpen: boolean;
  resetPasswordModalOpen: boolean;
  creating: boolean;
  editing: boolean;
  resettingPassword: boolean;
  onCreateOk: () => void;
  onEditOk: () => void;
  onResetPasswordOk: () => void;
  onCreateCancel: () => void;
  onEditCancel: () => void;
  onResetPasswordCancel: () => void;
};

const statusOptions = [
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' },
];

export function UserModals({
  createForm,
  editForm,
  resetPasswordForm,
  currentRecord,
  roleOptions,
  createModalOpen,
  editModalOpen,
  resetPasswordModalOpen,
  creating,
  editing,
  resettingPassword,
  onCreateOk,
  onEditOk,
  onResetPasswordOk,
  onCreateCancel,
  onEditCancel,
  onResetPasswordCancel,
}: UserModalsProps) {
  return (
    <>
      <Modal
        title="新增用户"
        open={createModalOpen}
        forceRender
        confirmLoading={creating}
        destroyOnHidden
        onOk={onCreateOk}
        onCancel={onCreateCancel}
      >
        <Form<CreateUserFormValues>
          form={createForm}
          layout="vertical"
          initialValues={{ status: '启用', roleIds: [] }}
        >
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入登录账号" />
          </Form.Item>

          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入用户姓名" />
          </Form.Item>

          <Form.Item
            label="初始密码"
            name="password"
            rules={[
              { required: true, message: '请输入初始密码' },
              { min: 6, message: '密码长度至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入初始密码" />
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

          <Form.Item label="角色" name="roleIds">
            <Select mode="multiple" placeholder="请选择角色" options={roleOptions} optionFilterProp="label" />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑用户"
        open={editModalOpen}
        forceRender
        confirmLoading={editing}
        destroyOnHidden
        onOk={onEditOk}
        onCancel={onEditCancel}
      >
        <Form<EditUserFormValues> form={editForm} layout="vertical">
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入登录账号" />
          </Form.Item>

          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入用户姓名" />
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

          <Form.Item label="角色" name="roleIds">
            <Select mode="multiple" placeholder="请选择角色" options={roleOptions} optionFilterProp="label" />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetPasswordModalOpen}
        forceRender
        confirmLoading={resettingPassword}
        destroyOnHidden
        onOk={onResetPasswordOk}
        onCancel={onResetPasswordCancel}
      >
        <Form<ResetPasswordFormValues> form={resetPasswordForm} layout="vertical">
          <Form.Item label="账号">
            <Input value={currentRecord?.account} disabled />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
